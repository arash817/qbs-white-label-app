/* eslint-disable  @typescript-eslint/no-explicit-any */
import { rest } from "msw";
import { APIError, ApiErrorCode } from "../../api/generic/error.interface";
import { mockRefresh } from "../../jest/jest.setup";
import { fireEvent, render, screen, waitFor } from "../../jest/test-utils";
import { server } from "../../mocks/server";
import { backendApiUrl } from "../../utils/axios";
import BusinessRegistration from "../BusinessRegistration";

describe("BusinessRegistration", () => {
  const mockNavigate = jest.fn();

  const createTestProps = (props: Record<string, unknown>) => ({
    navigation: {
      getParent: () => {
        return { navigate: mockNavigate };
      },
      navigate: mockNavigate,
    },
    ...props,
  });

  let props: any;

  it("displays the form fields with expected initial values", () => {
    props = createTestProps({});
    render(<BusinessRegistration {...props} />);

    const companyName = screen.getByLabelText("company name");
    const contactPerson = screen.getByLabelText("contact person full name");
    const businessEmail = screen.getByLabelText("business email");
    const countryOfRegistration = screen.getByLabelText(
      "country of registration"
    );
    const terms = screen.getByLabelText("terms checkbox");
    const createAccountButton = screen.getByLabelText("create account");

    expect(companyName.props.value).toBeUndefined();
    expect(contactPerson.props.value).toBeUndefined();
    expect(businessEmail.props.value).toBeUndefined();
    expect(countryOfRegistration.props.value).toBeUndefined();
    expect(terms.props.checked).toBeFalsy();
    expect(createAccountButton).toBeTruthy();
  });

  it("Fills in the form and creates the user", async () => {
    props = createTestProps({});
    render(<BusinessRegistration {...props} />);

    const companyName = screen.getByLabelText("company name");
    const contactPerson = screen.getByLabelText("contact person full name");
    const businessEmail = screen.getByLabelText("business email");
    const countryOfRegistration = screen.getByLabelText(
      "country of registration"
    );
    const terms = screen.getByLabelText("terms checkbox");
    const createAccountButton = screen.getByLabelText("create account");

    fireEvent(companyName, "onChangeText", "Test company");
    expect(companyName.props.value).toBe("Test company");

    fireEvent(contactPerson, "onChangeText", "John Doe");
    expect(contactPerson.props.value).toBe("John Doe");

    fireEvent(businessEmail, "onChangeText", "test@test.test");
    expect(businessEmail.props.value).toBe("test@test.test");

    expect(countryOfRegistration.props.value).toBeUndefined();
    fireEvent(countryOfRegistration, "onValueChange", "Austria");

    const updatedCountry = await screen.findByPlaceholderText("Select country");
    expect(updatedCountry.props.value).toBe("Austria");

    fireEvent(terms, "onChange", true);

    fireEvent(createAccountButton, "onPress");

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("Feedback", {
        title: "Account created!",
        description:
          "We will contact you to ask for more information to complete the business registration. You will not be able to access the app, expect an email from ur support team.",
        variant: "success",
        button: {
          caption: "Done",
          callback: expect.any(Function),
        },
      })
    );
  });

  it("creates a merchant account if the merchant API returns ExistingProperty as error", async () => {
    const mockedError: APIError = {
      Errors: [
        {
          Code: ApiErrorCode.ExistingProperty,
          Message: "Customer existing",
          Target: "Nexus",
        },
      ],
    };

    server.use(
      rest.post(
        `${backendApiUrl}/api/customers/merchant`,
        (_req, rest, ctx) => {
          return rest(ctx.status(400), ctx.json(mockedError));
        }
      )
    );

    props = createTestProps({});
    render(<BusinessRegistration {...props} />);

    const companyName = screen.getByLabelText("company name");
    const contactPerson = screen.getByLabelText("contact person full name");
    const businessEmail = screen.getByLabelText("business email");
    const countryOfRegistration = screen.getByLabelText(
      "country of registration"
    );
    const terms = screen.getByLabelText("terms checkbox");
    const createAccountButton = screen.getByLabelText("create account");

    fireEvent(companyName, "onChangeText", "Test company");
    expect(companyName.props.value).toBe("Test company");

    fireEvent(contactPerson, "onChangeText", "John Doe");
    expect(contactPerson.props.value).toBe("John Doe");

    fireEvent(businessEmail, "onChangeText", "test@test.test");
    expect(businessEmail.props.value).toBe("test@test.test");

    expect(countryOfRegistration.props.value).toBeUndefined();
    fireEvent(countryOfRegistration, "onValueChange", "Austria");

    const updatedCountry = await screen.findByPlaceholderText("Select country");
    expect(updatedCountry.props.value).toBe("Austria");

    fireEvent(terms, "onChange", true);

    fireEvent(createAccountButton, "onPress");

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("Feedback", {
        title: "Account created!",
        description:
          "We will contact you to ask for more information to complete the business registration. You will not be able to access the app, expect an email from ur support team.",
        variant: "success",
        button: {
          caption: "Done",
          callback: expect.any(Function),
        },
      })
    );
  });

  it("refreshes main navigation stack if an InvalidStatus error occurs", async () => {
    const mockedError: APIError = {
      Errors: [
        {
          Code: ApiErrorCode.InvalidStatus,
          Message: "Customer not active",
          Target: "Nexus",
        },
      ],
    };

    server.use(
      rest.post(`${backendApiUrl}/api/accounts`, (_req, rest, ctx) => {
        return rest(ctx.status(400), ctx.json(mockedError));
      })
    );

    props = createTestProps({});
    render(<BusinessRegistration {...props} />);

    const companyName = screen.getByLabelText("company name");
    const contactPerson = screen.getByLabelText("contact person full name");
    const businessEmail = screen.getByLabelText("business email");
    const countryOfRegistration = screen.getByLabelText(
      "country of registration"
    );
    const terms = screen.getByLabelText("terms checkbox");
    const createAccountButton = screen.getByLabelText("create account");

    fireEvent(companyName, "onChangeText", "Test company");
    expect(companyName.props.value).toBe("Test company");

    fireEvent(contactPerson, "onChangeText", "John Doe");
    expect(contactPerson.props.value).toBe("John Doe");

    fireEvent(businessEmail, "onChangeText", "test@test.test");
    expect(businessEmail.props.value).toBe("test@test.test");

    expect(countryOfRegistration.props.value).toBeUndefined();
    fireEvent(countryOfRegistration, "onValueChange", "Austria");

    const updatedCountry = await screen.findByPlaceholderText("Select country");
    expect(updatedCountry.props.value).toBe("Austria");

    fireEvent(terms, "onChange", true);

    fireEvent(createAccountButton, "onPress");

    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
  });

  it("refreshes main navigation stack if an CustomerNotActive error occurs", async () => {
    const mockedError: APIError = {
      Errors: [
        {
          Code: ApiErrorCode.CustomerNotActive,
          Message: "Customer not active",
          Target: "Nexus",
        },
      ],
    };

    server.use(
      rest.post(`${backendApiUrl}/api/accounts`, (_req, rest, ctx) => {
        return rest(ctx.status(400), ctx.json(mockedError));
      })
    );

    props = createTestProps({});
    render(<BusinessRegistration {...props} />);

    const companyName = screen.getByLabelText("company name");
    const contactPerson = screen.getByLabelText("contact person full name");
    const businessEmail = screen.getByLabelText("business email");
    const countryOfRegistration = screen.getByLabelText(
      "country of registration"
    );
    const terms = screen.getByLabelText("terms checkbox");
    const createAccountButton = screen.getByLabelText("create account");

    fireEvent(companyName, "onChangeText", "Test company");
    expect(companyName.props.value).toBe("Test company");

    fireEvent(contactPerson, "onChangeText", "John Doe");
    expect(contactPerson.props.value).toBe("John Doe");

    fireEvent(businessEmail, "onChangeText", "test@test.test");
    expect(businessEmail.props.value).toBe("test@test.test");

    expect(countryOfRegistration.props.value).toBeUndefined();
    fireEvent(countryOfRegistration, "onValueChange", "Austria");

    const updatedCountry = await screen.findByPlaceholderText("Select country");
    expect(updatedCountry.props.value).toBe("Austria");

    fireEvent(terms, "onChange", true);

    fireEvent(createAccountButton, "onPress");

    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
  });

  it("shows validation errors and solve them one by one", async () => {
    props = createTestProps({});
    render(<BusinessRegistration {...props} />);

    const companyName = screen.getByLabelText("company name");
    const contactPerson = screen.getByLabelText("contact person full name");
    const businessEmail = screen.getByLabelText("business email");
    const countryOfRegistration = screen.getByLabelText(
      "country of registration"
    );
    const createAccountButton = screen.getByLabelText("create account");

    fireEvent(createAccountButton, "onPress");

    // expect all fields to have an error
    const companyNameError = await screen.findByLabelText("company name error");

    const contactPersonError = screen.getByLabelText(
      "contact person full name error"
    );
    const businessEmailError = await screen.findByLabelText(
      "business email error"
    );
    const countryError = screen.getByLabelText("country of registration error");

    expect(companyNameError).toHaveTextContent("Company name is required");
    expect(contactPersonError).toHaveTextContent(
      "Contact person full name is required"
    );
    expect(businessEmailError).toHaveTextContent("Business email is required");
    expect(countryError).toHaveTextContent("Country is required");

    // fill in the company name and check the error is gone after pressing the create account button
    fireEvent(companyName, "onChangeText", "Test company");
    expect(companyName.props.value).toBe("Test company");

    fireEvent(createAccountButton, "onPress");
    const updatedCompanyNameError = await screen.queryByLabelText(
      "company name error"
    );

    expect(updatedCompanyNameError).toBeFalsy();

    // contact person name change
    fireEvent(contactPerson, "onChangeText", "John Doe");
    expect(contactPerson.props.value).toBe("John Doe");

    fireEvent(createAccountButton, "onPress");
    const updatedContactPersonNameError = await screen.queryByLabelText(
      "company name error"
    );

    expect(updatedContactPersonNameError).toBeFalsy();

    // business email change
    fireEvent(businessEmail, "onChangeText", "test@test.test");
    expect(businessEmail.props.value).toBe("test@test.test");

    fireEvent(createAccountButton, "onPress");
    const updatedBusinessEmailError = await screen.queryByLabelText(
      "business email error"
    );

    expect(updatedBusinessEmailError).toBeFalsy();

    // country change
    fireEvent(countryOfRegistration, "onValueChange", "Austria");

    const updatedCountry = await screen.findByPlaceholderText("Select country");
    expect(updatedCountry.props.value).toBe("Austria");

    fireEvent(createAccountButton, "onPress");
    const updatedCountryError = await screen.queryByLabelText(
      "business email error"
    );

    expect(updatedCountryError).toBeFalsy();
  });
});
