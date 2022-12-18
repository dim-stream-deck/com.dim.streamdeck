import { Container, MantineProvider } from "@mantine/core";
import ReactDOM from "react-dom/client";
import "./index.css";

export const render = (component: any) =>
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        primaryColor: "dim",
        colorScheme: "dark",
        defaultGradient: {
          deg: 140,
          from: "#f37625",
          to: "#aa4807",
        },
        primaryShade: { light: 5, dark: 5 },
        components: {
          Autocomplete: {
            styles: {
              input: {
                background: "#222222",
              },
            },
          },
          Divider: {
            styles: {
              label: {
                color: "#969696",
              },
            },
          },
          Alert: {
            styles: {
              root: {
                background: "#222222",
              },
            },
          },
          Paper: {
            styles: {
              root: {
                background: "#222222",
              },
            },
          },
          SegmentedControl: {
            styles: {
              root: {
                background: "#222222",
              },
            },
          },
        },
        colors: {
          dim: [
            "#ffeedd",
            "#ffd0b1",
            "#fab284",
            "#f79455",
            "#f37625",
            "#da5c0c",
            "#aa4807",
            "#7a3204",
            "#4b1d00",
            "#1f0700",
          ],
        },
      }}
    >
      <Container fluid ml={50} mt={16}>
        {component}
      </Container>
    </MantineProvider>
  );
