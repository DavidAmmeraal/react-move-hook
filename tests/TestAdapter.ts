import {
  createConnect,
  MovableConnectArgs,
} from "../packages/react-move-hook/src";

export class TestAdapter {
  public actions?: MovableConnectArgs["actions"];
  public element?: MovableConnectArgs["el"];
  public cleanup = jest.fn();

  connect = createConnect(({ actions, el }) => {
    this.actions = actions;
    this.element = el;
    return () => {
      this.cleanup();
    };
  })();
}
