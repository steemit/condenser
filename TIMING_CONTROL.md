# Performance Timing Control Guide

## Overview

All performance timing functionality is now controlled through the `TIME_LOG` environment variable to avoid unnecessary performance overhead in production environments.

## Environment Variable Control

### Enable Timing
```bash
export TIME_LOG=true
```

### Disable Timing (Default)
```bash
export TIME_LOG=false
# or simply don't set the environment variable
```

## Usage

### 1. Development Environment with Timing
```bash
# Enable detailed performance timing in development
TIME_LOG=true npm run dev
```

### 2. Production Environment without Timing
```bash
# Disable timing in production for better performance
TIME_LOG=false npm start
# or run directly (default is disabled)
npm start
```

### 3. Temporary Timing for Performance Analysis
```bash
# Temporarily enable timing to analyze specific request performance
TIME_LOG=true node server.js
```

## Timing Coverage

### RequestTimer Timers
- `appRender_ms` - Total appRender function execution time
- `userPreferences_ms` - User preferences processing time
- `specialPosts_ms` - Special posts loading time
- `initialState_ms` - Initial state construction time
- `assets_ms` - Asset file processing time
- `finalRender_ms` - Final rendering time
- `routerMatch_ms` - Router matching time
- `apiFetchState_ms` - API state fetching time
- `dataProcessing_ms` - Data post-processing time
- `storeCreation_ms` - Redux Store creation time
- `ssr_ms` - Server-side rendering time

### Console.time Timers
- `DEBUG: serverRender_total` - Total serverRender execution time
- `DEBUG: apiFetchState_total` - Total API fetching time
- `DEBUG: ssr_total` - Total SSR rendering time
- `DEBUG: getStateAsync` - Main state fetching time
- `DEBUG: getFeedHistoryAsync` - Feed price fetching time
- `DEBUG: getDynamicGlobalPropertiesAsync` - Dynamic global properties fetching time
- `DEBUG: loadPosts_[sort]_[tag]` - Posts list loading time
- `DEBUG: loadThread_[author]_[permlink]` - Single post loading time
- `DEBUG: get_community_[tag]` - Community information fetching time
- `DEBUG: get_profile_[account]` - User profile fetching time
- `DEBUG: get_trending_topics` - Trending topics fetching time
- `DEBUG: get_account_posts_[account]_[sort]` - User posts fetching time
- `DEBUG: get_ranked_posts_[sort]_[tag]` - Ranked posts fetching time
- `DEBUG: get_discussion_[author]_[permlink]` - Discussion fetching time
- `DEBUG: stateCleaner` - State cleaning time
- `DEBUG: loadSpecialPosts` - Special posts configuration loading time
- `DEBUG: loadFeaturedPosts` - Featured posts loading time
- `DEBUG: loadPromotedPosts` - Promoted posts loading time
- `DEBUG: loadNotices` - Notices loading time

## Performance Impact

### When Timing is Enabled
- Slight performance overhead (approximately 1-2ms)
- Console outputs detailed timing information
- RequestTimer records all timing data

### When Timing is Disabled
- Zero performance overhead
- No timing information output
- RequestTimer does not record timing data

## Recommended Usage Scenarios

### Development Environment
- Always enable `TIME_LOG=true`
- Use for performance debugging and optimization

### Production Environment
- Default to disabled `TIME_LOG=false`
- Only enable temporarily when performance analysis is needed

### Performance Testing
- Enable `TIME_LOG=true` for detailed performance analysis
- Disable after testing to get real performance data

## Important Notes

1. The `TIME_LOG` environment variable only accepts the string `'true'` to enable timing
2. Any other value (including `'false'`, `'0'`, `''`, etc.) will disable timing
3. Default state is disabled when the environment variable is not set
4. All timing functionality is thread-safe
