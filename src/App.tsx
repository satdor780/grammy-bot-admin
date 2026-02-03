import { useEffect } from "react";
import { CreateProduct } from "./components/modules";
import { useInit } from "./hooks/useInit";
import { useTelegramStore } from "./store/telegramStore";

function App() {
  const initData = useTelegramStore((s) => s.initData);
  const { mutate: sendInit } = useInit();

  useEffect(() => {
    if (initData) {
      sendInit(initData);
    }
  }, [initData, sendInit]);

  return (
    <CreateProduct />
  );
}

export default App;
