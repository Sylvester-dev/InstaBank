import { InjectedConnector } from "@web3-react/injected-connector";
import { PortisConnector } from "@web3-react/portis-connector";

const Injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 80001],
});
const Portis = new PortisConnector({
  dAppId: "d3bc009a-73c8-4117-8a88-a68f79ada9d5",
  networks: [1, 5, 15001],
});

export { Injected, Portis };