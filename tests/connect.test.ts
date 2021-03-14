import {
  connect,
  MovableActions,
  MovableConnect,
} from "../packages/react-move-hook/src";

describe("connect", () => {
  describe('takes a "connect" function', () => {
    const setup = () => {
      const cleanUp = jest.fn();
      const connectFn: MovableConnect = jest.fn(() => cleanUp);
      const conn = connect(connectFn);
      const actions = {} as MovableActions;
      const el = document.createElement("div");

      return { cleanUp, connectFn, conn, actions, el };
    };

    it('the returned function calls "connect" function with given actions and element', () => {
      const { conn, actions, el, connectFn } = setup();
      conn()({ actions, el });
      expect(connectFn).toHaveBeenLastCalledWith({ actions, el });
    });

    it('the returned function returns a clean up function that calls "connect" clean up function', () => {
      const { conn, actions, el, cleanUp } = setup();
      const disconnect = conn()({ actions, el });
      disconnect();
      expect(cleanUp).toHaveBeenCalledTimes(1);
    });

    it("the returned function is composable", () => {
      const { conn, connectFn, cleanUp, actions, el } = setup();

      const otherCleanUp = jest.fn();
      const otherConnectFn: MovableConnect = jest.fn(() => otherCleanUp);
      const otherConn = connect(otherConnectFn);
      const composedConn = conn(otherConn());
      const disconnect = composedConn({ actions, el });
      expect(connectFn).toHaveBeenLastCalledWith({ actions, el });
      expect(otherConnectFn).toHaveBeenLastCalledWith({ actions, el });
      disconnect();
      expect(cleanUp).toHaveBeenCalledTimes(1);
      expect(otherCleanUp).toHaveBeenCalledTimes(1);
    });
  });
});
