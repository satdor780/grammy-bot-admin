import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CreateProduct, PromoCodes, Transactions } from "./components/modules";
import { DebugPanel, Header } from "./components/widgets";
import { useInit } from "./hooks/useInit";
import { useDebugStore } from "./store/debugStore";
import { useTelegramStore } from "./store/telegramStore";

function App() {
  const initData = useTelegramStore((s) => s.initData);
  const addResponse = useDebugStore((s) => s.addResponse);
  const addError = useDebugStore((s) => s.addError);

  const { mutate: sendInit } = useInit({
    onSuccess: (data) => addResponse("Init success", data, "init"),
    onError: (err) => addError(err.message, err, "init"),
  });

  useEffect(() => {
    if (initData) {
      sendInit(initData);
    }
  }, [initData, sendInit]);

  return (
    <div className="px-3">
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/create-product" replace />} />
        <Route path="/create-product" element={<CreateProduct />} />
        <Route path="/promo-codes" element={<PromoCodes />} />
        <Route path="/transactions" element={<Transactions />} />
      </Routes>
      <DebugPanel />
    </div>
  );
}

export default App;
