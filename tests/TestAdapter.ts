import { connect, MovableConnectArgs } from "../packages/react-move-hook/src";

export class TestAdapter {
  public actions?: MovableConnectArgs["actions"];
  public element?: MovableConnectArgs["el"];
  public cleanup = jest.fn();

  connect = connect(({ actions, el }) => {
    this.actions = actions;
    this.element = el;
    return () => {
      this.cleanup();
    };
  })();
}
