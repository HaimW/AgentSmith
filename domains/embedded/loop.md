---
title: Embedded / Firmware / Hardware-Adjacent Domain Agents
summary: This domain is for building **embedded systems** (firmware, drivers, toolchains, hardware integration, lab validation).
skills: architecture-review, testing, ci-cd, log-analysis, performance-tuning, security-review
---

### Typical interactions (default "embedded delivery loop")

1. `embedded-product-manager` defines requirements and constraints (timing, power, memory, environment).
2. `embedded-system-architect` frames high-level design and interfaces; performs concise reviews.
3. `firmware-engineer` + `low-level-software-engineer` implement and validate on target/sim.
4. `hardware-integration-engineer` resolves bring-up and interface issues.
5. `qa-engineer-embedded` defines lab/HIL test plan; `test-automation-engineer-embedded` builds regression automation.
6. `devops-build-engineer-embedded` ensures toolchain + CI builds are reproducible and reliable.
