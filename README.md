# DorkVerse

Google dorks collection for bug bounty hunting. Built this to save time instead of searching for dorks manually every time.

## What's in here

Around 400+ dorks covering most of the common stuff you'd want to find during recon. Has filters for different tech stacks and vulnerability types which makes it easier to narrow down what you're looking for.

The domain you enter gets saved in localStorage so you don't have to keep typing it. You can either copy the dork to use elsewhere or just click search to run it directly in Google.

## Usage

Just open [dorkverse](https://asjadbut.github.io/dorkverse/) in your browser. Enter your target domain, use the filters if you want, and click on any dork to either copy it or search Google with it.

The filters let you narrow things down by tech (PHP, Node, React, Django, etc.) or by what you're hunting for (SQLi, XSS, SSRF, exposed configs, API keys, that kind of stuff).

## What kind of dorks are included

Covers the usual suspects - SQL injection, XSS, file inclusion, SSRF, RCE, IDOR, authentication bypasses, access control issues. Also has dorks for finding exposed configs, backups, API keys, cloud storage buckets, admin panels, sensitive documents, PII, and various framework-specific stuff.

There's coverage for common frameworks like WordPress, Laravel, Django, Flask, Spring Boot, React, Angular, and Vue. Plus cloud platforms (AWS, Azure, GCP), databases, CI/CD tools, and monitoring dashboards.

## Disclaimer

Only use this on targets you have permission to test. Unauthorized access is illegal and you'll get in trouble. Don't be stupid.

## Contributing

If you've got dorks that work well, feel free to fork and send a PR. Always looking to expand the collection.

## Author

[@asjadbut](https://github.com/asjadbut)
