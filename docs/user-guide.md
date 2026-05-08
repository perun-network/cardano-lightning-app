# Cardano Lightning Bridge User Guide

This guide explains how to use the public Cardano Lightning bridge demo at:

https://cardano-ln.perun.network

The application supports two workflows:

- **Onramp:** BTC via Lightning -> cBTC on Cardano Preprod
- **Offramp / offboard:** cBTC on Cardano Preprod -> BTC via Lightning

The demo uses testnet infrastructure. Use Bitcoin Signet and Cardano Preprod assets only.

## Before You Start

You need:

- A Cardano Preprod address with some ADA for transaction fees. This guide was tested with Eternl.
- A Lightning wallet or node that can pay or create testnet/Signet invoices. This guide was tested with the Coinbin browser wallet: https://ln.signet.coinbin.org/
- For the onramp flow, enough Lightning BTC to send to the operator. The Coinbin wallet used for testing included Lightning BTC.
- For the offramp flow, enough cBTC on Cardano Preprod to deposit to the operator address shown by the app.

## Onramp: BTC via Lightning -> cBTC on Cardano

Use the onramp flow when you want to pay a Lightning invoice and receive cBTC on Cardano Preprod.

### Step 1: Open the Bridge Page

Open the public demo https://cardano-ln.perun.network and select the BTC-to-Cardano direction. Change directions by clicking on the two arrows in the middle.

![Onramp step 1](./user-guide/onramp-1.jpg)

### Step 2: Enter the Amount and Cardano Address

Enter the amount in BTC you want to bridge and paste your Cardano Preprod receiving address. The address should start with `addr_test`.

![Onramp step 2](./user-guide/onramp-2.jpg)

### Step 3: Create the Swap Request

Submit the form. The app sends the request to the Connector API and creates a Lightning invoice for the onramp payment.

![Onramp step 3](./user-guide/onramp-3.jpg)

### Step 4: Pay the Lightning Invoice

Copy or scan the Lightning invoice and pay it from your Lightning wallet or test node.

![Onramp step 4](./user-guide/onramp-4.jpg)

### Step 5: Track Progress

After the Lightning payment is detected, the relay fulfills the Cardano-side invoice from the Liquidity Manager pool. The app shows progress while the transaction is submitted and indexed.

![Onramp step 5](./user-guide/onramp-5.jpg)

### Step 6: Confirm Completion

When the flow completes, verify the final status and, if needed, inspect the Cardano transaction through the linked explorer or history view.

![Onramp step 6](./user-guide/onramp-6.jpg)

## Offramp / Offboard: cBTC on Cardano -> BTC via Lightning

Use the offramp flow when you want to deposit cBTC on Cardano Preprod and receive BTC through a Lightning invoice.

### Step 1: Switch to the Offramp Direction

Open the bridge page and switch the direction to cBTC-to-Lightning by clicking the double arrows in the middle.

![Offramp step 1](./user-guide/offramp-1.jpg)

### Step 2: Prepare a Lightning Invoice

In your Lightning wallet, create a Lightning invoice for the amount you want to receive. This invoice defines where the relay will send the Lightning payment after your cBTC deposit is verified. Copy the Lightning invoice.

![Offramp step 2](./user-guide/offramp-2.jpg)

### Step 3: Enter the cBTC Amount and Refund Address

On the bridge page enter the equivalent cBTC amount from your Lightning Invoice (i.e. 0.00001 equals 1000 Satoshis), paste your Lightning invoice and paste your Cardano Preprod refund address. The refund address is used if the flow cannot complete and funds need to be returned according to the contract flow.

![Offramp step 3](./user-guide/offramp-3.jpg)

### Step 4: Submit the Offramp Request

Submit the form. The Connector creates an offramp request and returns the Cardano operator address that should receive the cBTC deposit.

![Offramp step 4](./user-guide/offramp-4.jpg)

### Step 5: Deposit Instructions

Copy the operator address.

![Offramp step 5](./user-guide/offramp-5.jpg)

### Step 6: Send the cBTC Deposit

Use your Cardano Preprod wallet to send the required cBTC amount to the operator address. Paste the operator address, click **Add assets** to add the cBTC token, and enter the equivalent amount.


![Offramp step 6](./user-guide/offramp-6.jpg)

### Step 7: Copy the Cardano Transaction Hash

After submitting the Cardano transaction, copy the transaction hash. The app uses this hash to ask the relay to verify the deposit.

![Offramp step 7](./user-guide/offramp-7.jpg)

### Step 8: Confirm the Deposit in the App

Paste the cBTC deposit transaction hash into the bridge app and click Confirm Deposit.

![Offramp step 8](./user-guide/offramp-8.jpg)

### Step 9: Wait for Deposit Verification

The relay checks the Cardano transaction and verifies that the expected cBTC amount was sent to the operator address.

![Offramp step 9](./user-guide/offramp-9.jpg)

### Step 10: Track Lightning Payment Progress

After the cBTC deposit is verified, the relay pays the Lightning invoice. The app shows progress while the payment and Cardano finalization steps complete.

![Offramp step 10](./user-guide/offramp-10.jpg)

### Step 11: Confirm Completion

Once the Lightning invoice is paid and the Cardano-side offramp is finalized, the app shows the completed state.

![Offramp step 11](./user-guide/offramp-11.jpg)

### Step 12: Review History

The offramp is now complete. You can verify the deposit or check the history view to review completed swaps and offramps, statuses, and transaction references.

![Offramp step 12](./user-guide/offramp-12.jpg)

## Troubleshooting

- If the app stays in a pending state, wait for Cardano Preprod indexing. Blockfrost indexing can lag behind submitted transactions.
- If an onramp does not complete, verify that the Lightning invoice was paid successfully.
- If an offramp deposit is not accepted, confirm that the transaction hash is correct and that the cBTC amount was sent to the exact operator address shown by the app.
- Use only Cardano Preprod addresses and testnet/Signet Lightning invoices for this demo.
- If a page is opened directly from a saved link and lacks context, start again from the bridge page. Some flow details are stored during the active browser session.

## Public Resources

- Public demo: https://cardano-ln.perun.network
- Connector base URL: http://cardano-ln.perun.network:30305
- Frontend repository: https://github.com/perun-network/cardano-lightning-app
- Relay repository: https://github.com/perun-network/cardano-lightning-relay
