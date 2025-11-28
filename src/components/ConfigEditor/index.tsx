import Editor, { Monaco, loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Drawer } from "@grafana/ui";

import YAML from "yaml";

import { Theme, useStyles, useTheme } from "../../theme";
import ComponentList from "../ComponentList";
import ComponentEditor from "../ComponentEditor";
import { useComponentContext, useModelContext } from "../../state";
import { css } from "@emotion/css";
import { GrafanaTheme2 } from "@grafana/data";
import { configureMonacoYaml } from "monaco-yaml";

import schema from "../../lib/schema.json";
import {
  Component,
  ComponentType,
  parseConfig,
  typeTitle,
} from "../../lib/parse";
import SectionList from "../SectionList";
import { cleanValues } from "../../lib/utils";

const defaultOpts: monaco.editor.IStandaloneEditorConstructionOptions = {
  fontSize: 15,
  minimap: { enabled: false },
  scrollbar: {
    vertical: "hidden",
    horizontal: "hidden",
  },
};

loader.config({ monaco });

const ConfigEditor = () => {
  const { model, setModel } = useModelContext();
  const { setComponents } = useComponentContext();
  const editorRef = useRef<null | monaco.editor.IStandaloneCodeEditor>(null);
  const monacoRef = useRef<null | Monaco>(null);
  const commandRef = useRef<null | {
    addComponent: string;
    editComponent: string;
  }>(null);
  const componentsRef = useRef<Component[]>([]);

  const styles = useStyles(getStyles);

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [currentComponent, setCurrentComponent] = useState<Component | null>(
    null,
  );

  const theme = useTheme();
  const editorTheme = useMemo(
    () =>
      theme.name.toLowerCase() === Theme.dark ? "thema-dark" : "thema-light",
    [theme],
  );

  const beforeMount = (monaco: Monaco) => {
    window.MonacoEnvironment = {
      getWorker(_, label) {
        switch (label) {
          case "editorWorkerService":
            return new Worker(
              new URL(
                "monaco-editor/esm/vs/editor/editor.worker",
                import.meta.url,
              ),
            );
          case "yaml":
            return new Worker(
              new URL("monaco-yaml/yaml.worker", import.meta.url),
            );
          default:
            throw new Error(`Unknown label ${label}`);
        }
      },
    };
    configureMonacoYaml(monaco, {
      enableSchemaRequest: true,
      schemas: [
        {
          // If YAML file is opened matching this glob
          fileMatch: ["*"],
          // And the URI will be linked to as the source.
          uri: "https://github.com/dash0hq/otelbin/blob/main/src/components/monaco-editor/schema.json",
          schema,
        },
      ],
    });
  };

  const provideCodeLenses = useCallback(function(
    model: monaco.editor.ITextModel,
    token: monaco.CancellationToken,
  ) {
    if (!commandRef.current) return;
    const { addComponent, editComponent } = commandRef.current;
    const lastLine = model.getLineCount();
    const lenses: monaco.languages.CodeLens[] = [
      {
        range: {
          startLineNumber: lastLine,
          endLineNumber: lastLine,
          startColumn: 1,
          endColumn: 1,
        },
        command: {
          id: addComponent,
          title: "Add Section",
        },
      },
    ];
    lenses.push(
      ...componentsRef.current.flatMap((c) => {
        if (c.type === "section") {
          if (c.name === "service") return [];
          return [
            {
              range: {
                startLineNumber: c.keyRange.begin.line,
                startColumn: c.keyRange.begin.col,
                endLineNumber: c.keyRange.end.line,
                endColumn: c.keyRange.end.col,
              },
              command: {
                id: editComponent,
                title: `Add ${typeTitle(c.name)}`,
                arguments: [c],
              },
            },
          ];
        }
        return [
          {
            range: {
              startLineNumber: c.keyRange.begin.line,
              startColumn: c.keyRange.begin.col,
              endLineNumber: c.keyRange.end.line,
              endColumn: c.keyRange.end.col,
            },
            command: {
              id: editComponent,
              title: `Edit ${typeTitle(c.type)}`,
              arguments: [c],
            },
          },
        ];
      }),
    );
    return {
      lenses,
      dispose: () => { },
    };
  }, []);
  const handleEditorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
      monaco.editor.defineTheme("thema-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#22252b",
        },
      });
      monaco.editor.defineTheme("thema-light", {
        base: "vs",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#F4F5F5",
        },
      });
      monaco.editor.setTheme(editorTheme);

      var addComponentCommand = editor.addCommand(
        0,
        function() {
          setCurrentComponent(null);
          // need a timeout to prevent the drawer from immediately closing as this happens during the mousedown event
          setTimeout(() => setDrawerOpen(true), 1);
        },
        "",
      );
      var editComponentCommand = editor.addCommand(
        0,
        function(ctx, component: Component) {
          setCurrentComponent(component);
          // need a timeout to prevent the drawer from immediately closing as this happens during the mousedown event
          setTimeout(() => setDrawerOpen(true), 1);
        },
        "",
      );

      commandRef.current = {
        addComponent: addComponentCommand!,
        editComponent: editComponentCommand!,
      };

      monaco.languages.registerCodeLensProvider("yaml", {
        provideCodeLenses,
        resolveCodeLens: function(model, codeLens, token) {
          return codeLens;
        },
      });
      editorRef.current = editor;
      monacoRef.current = monaco;
    },
    [editorTheme, provideCodeLenses],
  );

  const onChange = (text: string | undefined) => {
    setModel(text || "");
    localStorage.setItem("config.yaml", text || "");
  };

  const insertComponent = (component: Component) => {
    let editor = editorRef.current!!;
    let cc = currentComponent!!;

    const model = editor.getModel();
    const eol =
      (model?.getLineContent(cc.keyRange.begin.line).length ??
        cc.keyRange.end.col) + 1;

    let text = `\n${component.name}:`;
    const baseIndent = cc.keyRange.begin.col - 1 + 2;
    editor.executeEdits("insert-component", [
      {
        range: {
          startLineNumber: cc.keyRange.begin.line,
          startColumn: eol,
          endLineNumber: cc.keyRange.begin.line,
          endColumn: eol,
        },
        text: text.replaceAll("\n", "\n" + " ".repeat(baseIndent)),
      },
    ]);
    component.keyRange = {
      begin: {
        line: cc.keyRange.begin.line + 1,
        col: baseIndent + 1,
      },
      end: {
        line: cc.keyRange.begin.line + 1,
        col: baseIndent + text.length,
      },
    };
    setCurrentComponent(component);
  };

  const insertSection = (section: string) => {
    let editor = editorRef.current!!;

    const model = editor.getModel();
    const line = (model?.getLineCount() ?? 0) + 1;
    let text =
      section === "service"
        ? `\n${section}:\n  pipelines:\n`
        : `\n${section}:\n`;
    editor.executeEdits("insert-section", [
      {
        range: {
          startLineNumber: line,
          startColumn: 0,
          endLineNumber: line,
          endColumn: 0,
        },
        text: text,
      },
    ]);
    const c =
      section === "service"
        ? {
          type: "section" as ComponentType,
          name: "pipeline",
          keyRange: {
            begin: { line: line + 1, col: 3 },
            end: { line: line + 1, col: "pipeline".length + 3 },
          },
          value: {},
          schema: {},
        }
        : {
          type: "section" as ComponentType,
          name: section.slice(0, -1),
          keyRange: {
            begin: { line: line, col: 1 },
            end: { line: line, col: section.length + 1 },
          },
          value: {},
          schema: {},
        };
    setCurrentComponent(c);
  };

  const parseComponents = useCallback(() => {
    const components = parseConfig(model);
    setComponents(components);
    componentsRef.current = components;
  }, [model, setComponents, componentsRef]);

  useEffect(parseComponents, [model, parseComponents]);

  const updateComponent = (component: Component) => {
    const editor = editorRef.current!;
    setDrawerOpen(false);
    setCurrentComponent(null);
    const val = cleanValues(component.value, component.schema);
    let text = YAML.stringify(val).slice(0, -1); // marshall without final \n
    if (Object.keys(val).length === 0) text = "";
    const model = editor.getModel();
    const eol =
      (model?.getLineContent(component.keyRange.begin.line).length ??
        component.keyRange.end.col) + 1;
    if (component.valueRange?.end.col === 1) {
      component.valueRange.end.line -= 1;
      component.valueRange.end.col =
        model?.getLineContent(component.valueRange.end.line).length!! + 1;
    }
    if (text === "") {
      editor.executeEdits("configuration-editor", [
        {
          range: {
            startLineNumber: component.keyRange.begin.line,
            startColumn: eol,
            endLineNumber:
              component.valueRange?.end.line ?? component.keyRange.end.line,
            endColumn: component.valueRange?.end.col ?? eol,
          },
          text: "",
        },
      ]);
    } else if (component.valueRange) {
      const baseIndent = component.valueRange.begin.col - 1;
      editor.executeEdits("configuration-editor", [
        {
          range: {
            startLineNumber: component.valueRange.begin.line,
            startColumn: component.valueRange.begin.col,
            endLineNumber: component.valueRange.end.line,
            endColumn: component.valueRange.end.col,
          },
          text: text.replaceAll("\n", "\n" + " ".repeat(baseIndent)),
        },
      ]);
    } else {
      const baseIndent = component.keyRange.begin.col - 1 + 2;
      editor.executeEdits("configuration-editor", [
        {
          range: {
            startLineNumber: component.keyRange.begin.line,
            startColumn: eol,
            endLineNumber: component.keyRange.end.line,
            endColumn: eol,
          },
          text: ("\n" + text).replaceAll("\n", "\n" + " ".repeat(baseIndent)),
        },
      ]);
    }
  };

  return (
    <>
      <Editor
        options={defaultOpts}
        theme={editorTheme}
        height="95%"
        value={model}
        defaultLanguage="yaml"
        beforeMount={beforeMount}
        onMount={handleEditorDidMount}
        onChange={onChange}
      />
      <div className={styles.statusbar}>
        <span></span>
      </div>
      {isDrawerOpen && (
        <Drawer
          onClose={() => setDrawerOpen(false)}
          title={
            currentComponent?.type === "section"
              ? `Add ${typeTitle(currentComponent.name)}`
              : currentComponent
                ? `Edit ${typeTitle(
                  currentComponent?.type ?? "components",
                )} "${currentComponent?.name}"`
                : `Add Section`
          }
        >
          <div>
            {currentComponent?.type === "section" && (
              <ComponentList
                section={currentComponent}
                addComponent={insertComponent}
              />
            )}
            {currentComponent && currentComponent.type !== "section" && (
              <ComponentEditor
                component={currentComponent}
                updateComponent={updateComponent}
                discard={() => setDrawerOpen(false)}
              />
            )}
            {!currentComponent && <SectionList insertSection={insertSection} />}
          </div>
        </Drawer>
      )}
    </>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    statusbar: css`
      display: flex;
      justify-content: space-between;
      color: ${theme.colors.text.secondary};
      font-variant-numeric: tabular-nums;
    `,
  };
};
export default ConfigEditor;
