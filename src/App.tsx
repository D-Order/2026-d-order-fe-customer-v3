// style
import { ThemeProvider } from "styled-components";
import theme from "@styles/theme";
import GlobalStyle from "@styles/global";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//hook
import useVh from "@hooks/useCalcVh";

// router
import { RouterProvider } from "react-router-dom";
import router from "@routes/router";
function App() {
  useVh();

  return (
    <>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <RouterProvider router={router} />
      </ThemeProvider>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={true}
        style={{ padding: "1rem" }}
      />
    </>
  );
}

export default App;
