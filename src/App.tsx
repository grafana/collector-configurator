import { css } from "@emotion/css";
import { GrafanaTheme2 } from "@grafana/data";
import { useStyles } from "./theme";
import {
  Alert,
  Button,
  Input,
  Icon,
  Tooltip,
  VerticalGroup,
} from "@grafana/ui";
import Header from "./components/Header";
import ConfigEditor from "./components/ConfigEditor";
import { useState, useMemo } from "react";
import { useModelContext } from "./state";

function App() {
  const styles = useStyles(getStyles);
  const { model } = useModelContext();
  const [copied, setCopied] = useState(false);

  const shareLink = useMemo(
    () => `${window.location}?c=${btoa(model)}`,
    [model],
  );

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 5 * 1000);
  };

  return (
    <div className={styles.container}>
      <Header></Header>
      <section className={styles.section}>
        <div className={styles.hero}>
          <h1>Welcome to the Configuration Generator</h1>
          <p>This tool allows for easy configuration of the OTEL Collector</p>
          <hr />
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.editorWindow}>
          <ConfigEditor />
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.shareSection}>
          <h4>Share this Configuration</h4>
          <p>To share this configuration, use the following link:</p>
          <VerticalGroup>
            <Input
              value={shareLink}
              readOnly
              addonAfter={
                <Tooltip
                  content={(copied ? "Copied" : "Copy") + " link to clipboard"}
                >
                  <Button variant="secondary" onClick={copyLink}>
                    <Icon name={copied ? "check" : "copy"} />
                  </Button>
                </Tooltip>
              }
            />
            <Alert
              severity="warning"
              title="By copying the link to your clipboard you may be unintentionally sharing sensitive data. Check the included information before copying and ensure that you avoid sharing confidential data like secrets or API-Tokens"
            ></Alert>
          </VerticalGroup>
        </div>
      </section>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    section: css`
      width: 100%;
      padding-top: 20px;
      display: flex;
      justify-content: center;
    `,
    content: css`
      width: 80vw;
      display: flex;
      flex-wrap: nowrap;
      flex-direction: row;
      justify-content: space-between;
      gap: 10px;
    `,
    shareSection: css`
      width: 80vw;
      display: block;
      border: rgba(204, 204, 220, 0.07) solid 1px;
      background-color: ${theme.colors.background.secondary};
      border-radius: 2px;
      padding: ${theme.spacing(2, 2)};
    `,
    editorWindow: css`
      height: 60vh;
      width: 80vw;
      padding: 10px;
      border: rgba(204, 204, 220, 0.07) solid 1px;
      border-radius: 2px;
      background-color: ${theme.colors.background.secondary};
    `,
    container: css`
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      background: ${theme.colors.background.primary};
      font-family: Inter, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      justify-content: flex-start;
      padding-bottom: 10em;
    `,
    hero: css`
      width: 80vw;
    `,
    split: css`
      display: flex;
      gap: 2rem;
    `,
    splitLeft: css`
      height: 5rem;
    `,
    wizardModal: css`
      min-width: 50%;
    `,
  };
};

export default App;
