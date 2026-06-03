# Robots

Parse and analyze `robots.txt` content without making any network request.

```ts
import {
  analyzeRobotsUrls,
  analyzeRobotsRules,
  extractRobotsRules,
  extractRobotsSitemaps,
  matchRobotsPath,
} from '@jvpdls/seo-tools/robots';
```

## `extractRobotsRules(options)`

Parses grouped `User-agent`, `Allow`, `Disallow`, `Crawl-delay`, and `Host` directives.

### Result

```ts
{
  groups: Array<{
    userAgents: string[];
    rules: Array<{
      directive: 'allow' | 'disallow';
      value: string;
      line: number;
    }>;
    crawlDelay: number | null;
    host: string | null;
  }>;
  warningCodes: ExtractRobotsRulesWarningCode[];
}
```

### Warning codes

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | Empty `content` string |
| `MISSING_USER_AGENT` | One or more rule groups have no `User-agent` |

---

## `extractRobotsSitemaps(options)`

Extracts unique `Sitemap:` declarations.

### Result

```ts
{
  sitemaps: string[];
  warningCodes: ExtractRobotsSitemapsWarningCode[];
}
```

### Warning codes

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | Empty `content` string |

---

## `analyzeRobotsRules(options)`

Summarizes groups, rules, sitemap declarations, and the best-matching user-agent set.

### Result

```ts
{
  groups: RobotsGroup[];
  sitemaps: string[];
  totalGroups: number;
  totalRules: number;
  hasGlobalUserAgent: boolean;
  matchedUserAgents: string[];
  warningCodes: AnalyzeRobotsWarningCode[];
}
```

### Warning codes

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | Empty `content` string |
| `MISSING_USER_AGENT` | One or more rule groups have no `User-agent` |
| `MISSING_RULES` | No `Allow`/`Disallow` directives were found |
| `MISSING_SITEMAP` | No `Sitemap:` directives were found |

---

## `analyzeRobotsUrls(options)`

Runs a batch analysis for one or more absolute URLs against a `robots.txt` document.

### Result

```ts
{
  userAgent: string;
  urls: Array<{
    inputUrl: string;
    normalizedUrl: string | null;
    host: string | null;
    path: string | null;
    userAgent: string;
    allowed: boolean | null;
    matchedDirective: 'allow' | 'disallow' | null;
    matchedPattern: string | null;
    matchedUserAgents: string[];
    observations: RobotsUrlObservationCode[];
    warningCodes: RobotsUrlAnalysisWarningCode[];
  }>;
  total: number;
  allowedCount: number;
  blockedCount: number;
  invalidCount: number;
  hosts: string[];
  hasMixedHosts: boolean;
  warningCodes: AnalyzeRobotsUrlsWarningCode[];
}
```

### Per-URL warning codes

| Code | When |
| --- | --- |
| `INVALID_URL` | The provided entry is not a valid absolute URL |
| `BLOCKED_BY_ROBOTS` | The URL matched a `Disallow` directive |

### Per-URL observations

| Code | When |
| --- | --- |
| `ALLOWED_BY_ALLOW_RULE` | The URL matched an `Allow` directive |
| `BLOCKED_BY_DISALLOW_RULE` | The URL matched a `Disallow` directive |
| `ALLOWED_WITHOUT_MATCHING_RULE` | No matching allow/disallow rule was found |
| `MATCHED_GLOBAL_USER_AGENT` | The result came from the `User-agent: *` group |
| `MATCHED_SPECIFIC_USER_AGENT` | The result came from a more specific user-agent group |
| `HAS_QUERY_STRING` | The analyzed URL contains query parameters |

### Batch warning codes

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | Empty `content` string |
| `EMPTY_URLS` | No usable URL entries were provided |
| `INVALID_URL` | One or more provided entries are invalid |
| `BLOCKED_URLS_FOUND` | One or more URLs are blocked by robots |
| `MIXED_HOSTS` | The batch contains URLs from multiple hosts |

---

## `matchRobotsPath(options)`

Evaluates whether a given path is allowed or disallowed for a user-agent using the longest matching directive.

### Result

```ts
{
  path: string;
  userAgent: string;
  allowed: boolean | null;
  matchedDirective: 'allow' | 'disallow' | null;
  matchedPattern: string | null;
  warningCodes: MatchRobotsPathWarningCode[];
}
```

### Warning codes

| Code | When |
| --- | --- |
| `EMPTY_INPUT` | Empty `content` string |
| `INVALID_PATH` | Empty or invalid `path` value |
