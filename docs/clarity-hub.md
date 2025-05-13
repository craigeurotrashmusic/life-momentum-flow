
# Clarity Hub

The Clarity Hub provides a centralized overview of your key life metrics within Momentum OS. It aims to give you a single, actionable insight into how different areas of your life are converging.

## Score Calculations (Mocked Implementation)

In the current version, the backend calculations are mocked in the frontend for demonstration purposes.

### Metrics:

-   **`healthScore`**: (Number, 0-100)
    -   *Represents*: Normalized MPOS (My Perfect Operating System) stack adherence + sleep quality.
    -   *Mock Logic*: Starts at 75 and slightly randomizes on refresh.
-   **`wealthScore`**: (Number, 0-100)
    -   *Represents*: Current Wealth Alignment Score + sprint progress.
    -   *Mock Logic*: Starts at 82 and slightly randomizes on refresh.
-   **`simulationImpact`**: (Object)
    -   `healthDelta`, `wealthDelta`, `psychologyDelta` (Numbers)
    -   *Represents*: Latest scenario deltas from the Simulation Engine.
    -   *Mock Logic*: Static values: health: -2, wealth: 1, psychology: -5.
-   **`emotionalDrift`**: (Number, 0-100, lower is better)
    -   *Represents*: Recent Emotional Heatmap variance.
    -   *Mock Logic*: Starts at 15 and slightly randomizes on refresh.
-   **`flowIndex`**: (Number, 0-100)
    -   *Represents*: Confidence-weighted average of recent flow windows.
    -   *Mock Logic*: Starts at 60 and slightly randomizes on refresh.
-   **`overallClarityScore`**: (Number, 0-100)
    -   *Represents*: A weighted aggregation of the other key metrics.
    -   *Mock Calculation*:
        -   Health: 30%
        -   Wealth: 30%
        -   Emotion (100 - Drift): 20%
        -   Flow: 20%
-   **`timestamp`**: (String ISO Date)
    -   Timestamp of the last metrics update.
-   **`trend`**: ('up' | 'down' | 'stable')
    -   Trend of the `overallClarityScore` compared to the previous value.

## Integration Points (Mocked)

-   **API Endpoints**:
    -   `GET /clarity-metrics` (mocked by `fetchClarityMetrics` in `src/lib/api.ts`): Returns the latest (mocked) clarity metrics.
    -   `POST /clarity-metrics/refresh` (mocked by `refreshClarityMetrics` in `src/lib/api.ts`): Simulates triggering a recalculation of metrics.
-   **Real-time Updates**:
    -   The Clarity Hub card uses `@tanstack/react-query` to periodically refetch metrics (every 30 seconds) to simulate real-time updates. True WebSocket integration would require a backend.

## Future Enhancements

-   Integration with a real backend (e.g., Supabase) for persistent storage and actual calculations.
-   WebSocket integration for true real-time updates.
-   More sophisticated UI for the overall Clarity Score (e.g., radial gauge).
-   Detailed drill-down views for each pillar.
-   Enhanced actionable micro-leverages with direct integration to relevant app sections.
