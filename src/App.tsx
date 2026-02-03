import { useEffect } from "react";
import { CreateProduct } from "./components/modules";
import { DebugPanel } from "./components/widgets";
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
    <>
      <CreateProduct />
      <DebugPanel />
    </>
  );
}

export default App;
