import { AccountUpdate, Field, Mina, PrivateKey, PublicKey } from 'o1js';
import { AgeVerification } from './AgeVerification'; // Import the correct contract

let proofsEnabled = false;

describe('AgeVerification', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    senderAccount: Mina.TestPublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: AgeVerification; // Update to use AgeVerification instead of Add

  beforeAll(async () => {
    if (proofsEnabled) await AgeVerification.compile(); // Update compile for AgeVerification
  });

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    [deployerAccount, senderAccount] = Local.testAccounts;
    let feePayer = Local.testAccounts[0].key;
    deployerKey = deployerAccount.key;
    senderKey = senderAccount.key;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new AgeVerification(zkAppAddress); // Instantiate AgeVerification contract
  });

  

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('generates and deploys the `AgeVerification` smart contract', async () => {
    await localDeploy();
    const valid = zkApp.valid.get(); // Access the 'valid' state variable
    expect(valid).toEqual(Field(0)); // Initially, the contract should set 'valid' to Field(0)
  });

  it('correctly verifies the age in the `AgeVerification` smart contract', async () => {
    await localDeploy();

    const age = Field(25); // Example age value
    const threshold = Field(18); // Example threshold value

    // Call the verifyAge method
    const txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.verifyAge(age, threshold); // Use the verifyAge method
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    const valid = zkApp.valid.get(); // Check the validity state after verification
    expect(valid).toEqual(Field(1)); // Expected to be valid if age >= threshold
  });
});
