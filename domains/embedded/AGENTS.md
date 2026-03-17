## Embedded / Firmware / Hardware-Adjacent Domain Agents

This domain is for building **embedded systems** (firmware, drivers, toolchains, hardware integration, lab validation).

### Roles (agents)

- `embedded-product-manager`: requirements, constraints, certification/regulatory constraints, release priorities.
- `embedded-system-architect`: hardware/software boundaries, timing/memory/power constraints; concise reviews.
- `firmware-engineer`: application firmware, RTOS tasks, protocols, state machines.
- `low-level-software-engineer`: drivers, BSP, interrupts, DMA, performance.
- `hardware-integration-engineer`: board bring-up, interfaces, signal integrity constraints (as relevant).
- `qa-engineer-embedded`: lab testing, reliability, edge cases, HIL coordination.
- `test-automation-engineer-embedded`: HIL/simulation/regression automation.
- `devops-build-engineer-embedded`: toolchains, build systems, packaging, artifacts, reproducible builds.

### Typical interactions (default “embedded delivery loop”)

1. `embedded-product-manager` defines requirements and constraints (timing, power, memory, environment).
2. `embedded-system-architect` frames high-level design and interfaces; performs concise reviews.
3. `firmware-engineer` + `low-level-software-engineer` implement and validate on target/sim.
4. `hardware-integration-engineer` resolves bring-up and interface issues.
5. `qa-engineer-embedded` defines lab/HIL test plan; `test-automation-engineer-embedded` builds regression automation.
6. `devops-build-engineer-embedded` ensures toolchain + CI builds are reproducible and reliable.

### Key skills commonly used

- `architecture-review`, `testing`, `ci-cd`, `log-analysis`, `performance-tuning`, `security-review`

