import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DataPage from "./pages/DataPage";
import ConfigPage from "./pages/ConfigPage"
import ProtocolPage from "./pages/ProtocolPage";
import ProtocolDataPage from "./pages/ProtocolDataPage";
import { StatsPage } from "./pages/StatsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/iot-platform/login"
          exact
          element={<LoginPage />}
        ></Route>
        <Route path="/iot-platform/dashboard" exact element={<DataPage />}></Route>
        <Route path="/iot-platform/config" exact element={<ConfigPage />}></Route>
        <Route path="/iot-platform/protocol" exact element={<ProtocolPage />}></Route>
        <Route path="/iot-platform/protocol-data/:id" exact element={<ProtocolDataPage />}></Route>
        <Route path="/iot-platform/protocol-stats" exact element={<StatsPage />}></Route>
        <Route path="*" element={<LoginPage />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
