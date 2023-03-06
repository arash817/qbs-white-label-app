import { render, screen } from "../../jest/test-utils";
import PortfolioOverview from "../PortfolioOverview";

describe("Portfolio overview screen", () => {
  const createTestProps = (props: Record<string, unknown>) => ({
    navigation: {
      navigate: jest.fn(),
    },
    ...props,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let props: any;

  it("Loads expected UI", () => {
    props = createTestProps({});
    render(<PortfolioOverview {...props} />);

    const buttons = screen.getByLabelText("action buttons");
    const loadingBalance = screen.getByLabelText("balance panel");
    const loadingTransactions = screen.getByLabelText("loading transactions");

    expect(buttons).toBeTruthy();
    expect(loadingBalance).toBeTruthy();
    expect(loadingTransactions).toBeTruthy();
  });
});
