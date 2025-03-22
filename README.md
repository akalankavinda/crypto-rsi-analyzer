# Crypto RSI Analyzer

This is simple application which can detect RSI divergences using candlestick chart data.<br>Following are the primary features of the application

- Detect regular RSI divergences
- Detect hidden RSI divergence
- Push alerts to a Telegram channel
- Push important logs to a Telegram Channel

&nbsp;

## Running locally

**Step 1**: Clone the repository

```bash
  git clone https://github.com/akalankavinda/crypto-rsi-analyzer.git
```

**Step 2**: Go to the project directory

```bash
  cd crypto-rsi-analyzer
```

**Step 3**: Install dependencies

```bash
  npm install
```

&nbsp;

**Step 4**: Setup the env file

- Rename the `env.backup.ts` to `env.ts`
- Set proper values for the environment variables

&nbsp;

**Step 5**: Run the project

```bash
  npm start
```

Or, you can build the project first and then run the build output

```bash
  npm run build
```

```bash
  node .\dist\crypto-rsi-analyzer.js
```

&nbsp;

## Scheduling analyzer using `crontab`

> [!NOTE]
> Following section at the end of `main.ts` is responsible for keeping the analyzer process alive.
> <br>
> If you want to schedule the analyzer script to run as a `Cron-Job`, You must comment out this section, in order to properly exit the process each time it is triggered by the `cron daemon`
>
> ```ts
> // Start of keep-alive section ================================================
> //
> Utils.logMessage("-------------------------");
> Utils.logMessage("Analyzer started");
> Utils.logMessage("-------------------------");
>
> const reTryInterval = 1000 * 60; // 1 minute
> setInterval(() => {
>   executeAnalysis();
> }, reTryInterval);
> //
> // End of keep-alive section ===================================================
> ```

&nbsp;

**Step 1**: Get rid of the keep-alive logic

- Comment out the `keep-alive section` in the `main.ts` file or,
- Remove the `keep-alive section` from `main.ts`

**Step 2**: Setup crontab

2. Add the following rule at the end of the crontab

```bash
  0,15,30,45 * * * * /usr/bin/node /PATH/TO/ANALYZER_SCRIPT/crypto-rsi-analyzer.js >> /PATH/TO/LOG_FILE/crypto-rsi-analyzer.log 2>&1
```

> [!TIP]
> Make sure the permissions are set properly
>
> - `crypto-rsi-analyzer.js` -> Requires executable permission
> - `crypto-rsi-analyzer.log` -> Requires writable permission
