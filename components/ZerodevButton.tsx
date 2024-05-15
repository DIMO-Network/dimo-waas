import { useCreateKernelClientPasskey, useKernelClient } from "@zerodev/waas";

const ZerodevButton = () => {
  const { connectRegister, isPending } = useCreateKernelClientPasskey({
    version: "v3",
  });
  const { address } = useKernelClient();

  return (
    <button
      id="zerodevbutton"
      style={{ backgroundColor: "blue", color: "white" }}
      disabled={isPending}
      onClick={() => {
        connectRegister({ username: "zerodev_quickstart" });
      }}
    >
      {address ? `smart address: ${address}` : "Create zerodev smart account"}
    </button>
  );
};

export default ZerodevButton;
