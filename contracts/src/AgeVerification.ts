import { Field, SmartContract, state, State, method } from 'o1js';

/**
 * Private Age Verification Contract
 * The contract will verify if the user's age is greater than or equal to the threshold age.
 * The contract uses zero-knowledge proofs to keep the user's age private.
 */
export class AgeVerification extends SmartContract {
  // State variable to store the verification result (valid or invalid)
  @state(Field) valid = State<Field>();

  // Method to initialize the state
  init() {
    super.init();
    this.valid.set(Field(0)); // Default is invalid
  }

  // Method to verify the age
  @method async verifyAge(age: Field, threshold: Field) {
 

    // Compute age - threshold
    const difference = age.sub(threshold);

    // Use circuit-compatible logic to check if the difference is non-negative
    const isValid = difference.equals(Field(0)).or(difference.greaterThanOrEqual(Field(0)))
      ? Field(1)
      : Field(0);

    // Set the validity of the verification result
    this.valid.set(isValid);
  }
}
