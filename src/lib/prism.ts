import Prism from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-xml-doc";

if (typeof window !== "undefined") {
    Prism.languages.http = {
        "request-line": {
            pattern:
                /^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|TRACE|CONNECT) (.+?) (HTTP\/[\d.]+)/m,
            inside: {
                method: {
                    pattern: /^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|TRACE|CONNECT)/,
                    alias: "http-method",
                },
                url: {
                    pattern: /(.+?)(?=\s+HTTP\/)/,
                    inside: {
                        path: /^(?:\/[^?#\s]*)/,
                        query: {
                            pattern: /\?[^#\s]*/,
                            inside: {
                                "query-delimiter": /^\?/,
                                "query-param": {
                                    pattern: /([^&=]+)=([^&]*)/g,
                                    inside: {
                                        "param-name": /^[^=]+/,
                                        "param-value": /(?<==)[^&]*/,
                                    },
                                },
                                "query-separator": /&/,
                            },
                        },
                    },
                },
                "http-version": /HTTP\/[\d.]+$/,
            },
        },
        "status-line": {
            pattern: /^HTTP\/[\d.]+ \d{3} .+/m,
            inside: {
                "http-version": /^HTTP\/[\d.]+/,
                "success-status": {
                    pattern: /\b2\d{2}\b/,
                    alias: "status-code-200",
                },
                "success-text": {
                    pattern: /(?<=2\d{2} ).+/,
                    alias: "status-text-200",
                },
                "redirect-status": {
                    pattern: /\b3\d{2}\b/,
                    alias: "status-code-300",
                },
                "redirect-text": {
                    pattern: /(?<=3\d{2} ).+/,
                    alias: "status-text-300",
                },
                "client-error-status": {
                    pattern: /\b4\d{2}\b/,
                    alias: "status-code-400",
                },
                "client-error-text": {
                    pattern: /(?<=4\d{2} ).+/,
                    alias: "status-text-400",
                },
                "server-error-status": {
                    pattern: /\b5\d{2}\b/,
                    alias: "status-code-500",
                },
                "server-error-text": {
                    pattern: /(?<=5\d{2} ).+/,
                    alias: "status-text-500",
                },
            },
        },
        "cookie-header": {
            pattern: /^Cookie: .+$/m,
            inside: {
                "header-name": {
                    pattern: /^Cookie/,
                    alias: "keyword",
                },
                "cookie-pair": {
                    pattern: /([^=\s;]+)=([^;]+)(?:;|$)/g,
                    inside: {
                        "cookie-name": {
                            pattern: /^[^=]+/,
                        },
                        "cookie-value": {
                            pattern: /(?<==)[^;]*/,
                        },
                        punctuation: /[=;]/,
                    },
                },
                punctuation: /:/,
            },
        },
        header: {
            pattern: /^(?!Cookie:)[A-Za-z0-9-]+: .+$/m,
            inside: {
                "header-name": {
                    pattern: /^[^:]+/,
                    alias: "keyword",
                },
                "header-value": {
                    pattern: /(?<=: ).+/,
                },
                punctuation: /:/,
            },
        },
    };
}

export default Prism;
