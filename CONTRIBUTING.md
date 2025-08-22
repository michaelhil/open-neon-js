# Contributing to Open Neon JS

> **Welcome to the Open Neon research community!** 🎯
> 
> We're building the gold standard for eye tracking APIs in JavaScript, designed specifically for research applications. Your contributions help advance scientific discovery worldwide.

## 🚀 Quick Start for Contributors

### Development Environment Setup

**Prerequisites:**
- **Node.js** ≥18.0.0 or **Bun** ≥1.0.0
- **Git** for version control
- **Pupil Labs Neon device** (optional - we have comprehensive mock hardware)

**Setup Steps:**
```bash
# 1. Fork and clone the repository
git clone https://github.com/michaelhil/open-neon-js.git
cd open-neon-js

# 2. Install dependencies (works with both npm and bun)
npm install
# or
bun install

# 3. Run tests to verify setup
npm run test:all

# 4. Start development with hot reload
npm run dev
```

**Verify Installation:**
```bash
# Test with mock hardware (no physical device needed)
npm run mock-server      # Terminal 1: Start mock device
npm run test:integration  # Terminal 2: Run integration tests
```

### Project Architecture

```
open-neon-js/
├── 📦 packages/
│   ├── core/          # Shared types, utilities, and business logic
│   ├── node/          # Node.js implementation (full protocol support)
│   ├── browser/       # Browser-optimized (WebSocket streaming)
│   └── api/           # Auto-detecting meta package
├── 🧪 test-utils/     # Mock hardware & testing infrastructure
├── 📚 examples/       # Living documentation & demos
├── 🔧 scripts/       # Build and development automation
└── 📋 TESTING.md      # Comprehensive testing guide
```

## 🎯 Contribution Guidelines

### What We're Looking For

**High-Impact Contributions:**
- **Research workflow integrations** (PsychoPy, jsPsych, R, MATLAB)
- **Performance optimizations** for real-time data processing
- **Cross-platform compatibility** improvements
- **Academic use case examples** and documentation
- **Hardware compatibility** testing and validation

**Research-Specific Needs:**
- **Data integrity validation** and error detection
- **Reproducibility tools** for scientific experiments
- **Institutional IT compatibility** (firewalls, proxies, authentication)
- **Accessibility features** for diverse research populations
- **Privacy-preserving telemetry** for usage analytics

### Code Standards

**TypeScript via JSDoc:**
```javascript
/**
 * Process gaze data for research analysis
 * @param {GazeData[]} gazeData - Array of gaze samples
 * @param {Object} options - Processing options
 * @param {number} options.smoothingWindow - Smoothing window size in ms
 * @param {number} options.confidenceThreshold - Minimum confidence (0-1)
 * @returns {Promise<ProcessedGazeData[]>} Processed gaze data
 */
export const processGazeData = async (gazeData, options = {}) => {
  // Implementation with proper validation and error handling
}
```

**Functional Composition (No Classes):**
```javascript
// ✅ Good: Functional composition
export const createDevice = (address, options = {}) => {
  const state = { connected: false, streaming: false }
  
  return {
    async connect() { /* implementation */ },
    async startStreaming() { /* implementation */ },
    getState: () => ({ ...state })
  }
}

// ❌ Avoid: Class-based patterns
class Device {
  constructor(address) { /* avoid */ }
}
```

**Error Handling Best Practices:**
```javascript
import { createError, ErrorCodes } from '@open-neon/core'

// Structured errors with research context
throw createError(
  'CalibrationError',
  'Calibration failed due to insufficient gaze data',
  ErrorCodes.CALIBRATION_INSUFFICIENT_DATA,
  {
    samplesCollected: 45,
    minimumRequired: 100,
    suggestion: 'Ensure participant maintains focus on calibration points',
    researchImpact: 'high',
    debugSteps: [
      'Check participant positioning',
      'Verify lighting conditions',
      'Increase calibration point duration'
    ]
  }
)
```

### Testing Requirements

**Comprehensive Test Coverage:**
```bash
# All contributions must pass these tests
npm run lint          # Code style and quality
npm run typecheck     # TypeScript validation
npm run test:all      # Unit + Integration + Performance
npm run build         # Cross-platform build verification
```

**Research-Focused Testing:**
- **Unit tests** for individual functions and utilities
- **Integration tests** with mock hardware simulation
- **Performance tests** for real-time data processing
- **Cross-platform tests** on macOS, Windows, Linux
- **Browser compatibility** across Chrome, Firefox, Safari, Edge

**Writing Good Tests:**
```javascript
import { assert, generators, perf } from '../test-utils/test-helpers.js'

describe('Gaze Data Processing', () => {
  it('should maintain timing accuracy under load', async () => {
    const gazeSequence = generators.gazeSequence(1000, { sampleRate: 200 })
    
    const result = await perf.measure(() => 
      processGazeData(gazeSequence, { realTime: true })
    )
    
    assert.performance(result.duration, 50, 0.2, {
      researchContext: 'real-time processing requirement',
      acceptableTolerance: '20% for research applications'
    })
  })
})
```

### Pull Request Process

**Before Submitting:**
1. **Create feature branch** from `main`: `git checkout -b feature/research-integration`
2. **Write comprehensive tests** for your changes
3. **Update documentation** if adding new APIs
4. **Test with mock hardware** to ensure no device dependencies
5. **Verify cross-platform compatibility**

**PR Requirements:**
- **Clear description** of research use case and benefits
- **Test coverage** for all new functionality
- **Performance impact** assessment for real-time features
- **Breaking change notice** if applicable
- **Research community impact** description

**PR Template:**
```markdown
## Research Use Case
Describe the specific research scenario this addresses.

## Changes Made
- [ ] Added new API for [specific functionality]
- [ ] Improved performance by [specific improvement]
- [ ] Fixed issue with [specific problem]

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests with mock hardware
- [ ] Performance benchmarks if applicable
- [ ] Cross-platform testing completed

## Research Impact
- **Target Research Areas:** [e.g., cognitive psychology, HCI, neuroscience]
- **Expected Benefits:** [e.g., improved data quality, easier integration]
- **Breaking Changes:** [None / List any breaking changes]

## Documentation
- [ ] API documentation updated
- [ ] Examples added/updated
- [ ] Research integration guide updated if applicable
```

### Code Review Process

**What Reviewers Look For:**
- **Research applicability** - Does this solve real research problems?
- **Data integrity** - Will this maintain research data quality?
- **Performance impact** - Does this affect real-time processing?
- **Cross-platform compatibility** - Works on researcher setups?
- **API consistency** - Follows existing patterns?
- **Test coverage** - Adequate testing for research reliability?

**Review Timeline:**
- **Community PRs:** 3-5 business days
- **Research-critical fixes:** 24-48 hours
- **Performance improvements:** 1-2 weeks (thorough testing required)

## 🧪 Research-Specific Contribution Areas

### Academic Integration Examples

**PsychoPy Integration:**
```python
# Python side (PsychoPy experiment)
import psychopy
from websocket import create_connection

# JavaScript side (Open Neon)
const device = await connectToDevice('192.168.1.100:8080')
const gazeStream = device.createGazeStream()

gazeStream.subscribe({
  next: (gaze) => {
    // Send to PsychoPy via WebSocket
    psychopySocket.send(JSON.stringify({
      type: 'gaze',
      x: gaze.x,
      y: gaze.y,
      confidence: gaze.confidence,
      timestamp: gaze.timestamp
    }))
  }
})
```

**R Statistical Analysis Integration:**
```r
# R side - data import and analysis
library(jsonlite)
library(dplyr)

# JavaScript side - data export
const exportToR = (gazeData) => {
  const rCompatibleData = gazeData.map(sample => ({
    participant_id: sample.participantId,
    trial_id: sample.trialId,
    gaze_x: sample.x,
    gaze_y: sample.y,
    confidence: sample.confidence,
    timestamp_ms: sample.timestamp * 1000
  }))
  
  return JSON.stringify(rCompatibleData, null, 2)
}
```

### Research Workflow Examples

**Longitudinal Study Support:**
```javascript
// Multi-session data continuity
const sessionManager = createSessionManager({
  studyId: 'longitudinal_attention_2024',
  participantId: 'P001',
  sessionNumber: 3,
  dataFormat: 'research_standard_v2',
  backwardCompatibility: true
})

await sessionManager.initializeSession({
  calibrationData: previousSession.calibration,
  hardwareConfiguration: previousSession.hardware,
  dataQualityThresholds: studyProtocol.quality
})
```

**Multi-Site Research Coordination:**
```javascript
// Standardized setup across research sites
const siteConfiguration = {
  institutionId: 'anonymized_hash',
  hardwareModel: 'neon_v2',
  softwareVersion: '0.1.0-beta.1',
  calibrationProtocol: 'extended_9_point',
  dataQualityRequirements: {
    minimumConfidence: 0.8,
    maximumDataLoss: 0.05,
    calibrationAccuracy: 1.0 // degrees
  }
}
```

## 🤝 Community Guidelines

### Research Community Values

**Open Science Principles:**
- **Reproducibility** - All contributions should enhance research reproducibility
- **Transparency** - Open development process with clear decision rationale
- **Accessibility** - Consider diverse research environments and populations
- **Collaboration** - Foster cross-institutional knowledge sharing

**Inclusive Research Environment:**
- **Respectful communication** in all interactions
- **Constructive feedback** focused on research impact
- **Diverse perspectives** welcomed from all research disciplines
- **Mentorship support** for new contributors from research community

### Communication Channels

**GitHub Issues:**
- **Bug reports** with research context and impact assessment
- **Feature requests** with research use case descriptions
- **Performance issues** with real-world research scenario details

**GitHub Discussions:**
- **Research showcase** - Share how you're using Open Neon in your research
- **Technical questions** - Get help with integration and setup
- **Best practices** - Share research methodology insights
- **Community announcements** - Research conferences, papers, collaborations

**Research Community Support:**
- **Academic conferences** - Meet maintainers at vision, HCI, and psychology conferences
- **Research presentations** - Request presentations for your research group
- **Collaboration opportunities** - Connect with other research institutions

### Recognition and Attribution

**Contributor Recognition:**
- **Research paper citations** - Contributors acknowledged in research publications
- **Academic presentations** - Contributor recognition at conferences
- **Research impact tracking** - Monitor how contributions advance scientific discovery

**Academic Collaboration:**
- **Co-authorship opportunities** for significant research contributions
- **Grant proposal collaboration** for funded research initiatives
- **Academic mentorship** connections between contributors

## 🔧 Development Workflows

### Local Development

**Hot Reload Development:**
```bash
# Terminal 1: Start mock device
npm run mock-server

# Terminal 2: Watch and rebuild packages
npm run dev

# Terminal 3: Run tests in watch mode  
npm run test:watch

# Terminal 4: Test integration continuously
npm run test:integration
```

**Performance Profiling:**
```bash
# Profile real-time processing performance
npm run test:performance -- --profile=true

# Analyze bundle sizes
npm run analyze-bundle

# Memory usage testing
npm run test:memory -- --duration=300s
```

### Release Process

**Beta Release Checklist:**
- [ ] All tests passing on CI/CD
- [ ] Performance benchmarks within acceptable ranges
- [ ] Cross-platform compatibility verified
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Research community notified

**Version Strategy:**
- **Beta versions:** `0.1.0-beta.1`, `0.1.0-beta.2`, etc.
- **Release candidates:** `0.1.0-rc.1`, `0.1.0-rc.2`, etc.
- **Stable releases:** `1.0.0`, `1.1.0`, etc.

## 📚 Resources for Contributors

### Research Background

**Eye Tracking Fundamentals:**
- [Holmqvist et al. (2011) - Eye Tracking: A Comprehensive Guide](https://www.researchgate.net/publication/267851146)
- [Duchowski (2017) - Eye Tracking Methodology](https://link.springer.com/book/10.1007/978-3-319-57883-5)

**Research Software Best Practices:**
- [Wilson et al. (2017) - Good enough practices in scientific computing](https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1005510)
- [Research Software Engineering Guide](https://guide.esciencecenter.nl/)

### Technical Documentation

**API References:**
- [Core API Documentation](./packages/core/README.md)
- [Node.js Implementation](./packages/node/README.md)
- [Browser Implementation](./packages/browser/README.md)

**Testing Guides:**
- [Comprehensive Testing Strategy](./TESTING.md)
- [Mock Hardware Documentation](./test-utils/README.md)
- [Performance Testing Guide](./docs/performance-testing.md)

### Getting Help

**Technical Support:**
1. **Check existing issues** - Your question might already be answered
2. **Search documentation** - Comprehensive guides available
3. **Create GitHub issue** - Use appropriate template for your question type
4. **Join discussions** - Community support in GitHub Discussions

**Research Support:**
1. **Research methodology questions** - Connect with research community
2. **Integration assistance** - Platform-specific integration help
3. **Performance optimization** - Research workflow optimization
4. **Best practices** - Learn from other research institutions

---

## 🏆 Thank You for Contributing!

Every contribution to Open Neon JS advances scientific research worldwide. Whether you're:

- **🔬 A researcher** improving data collection workflows
- **💻 A developer** enhancing technical capabilities  
- **📚 A documenter** making science more accessible
- **🧪 A tester** ensuring research reliability
- **🌍 A community builder** connecting research institutions

Your work matters and helps scientists focus on discovery rather than technical barriers.

**Together, we're building the future of research software.** 🚀

---

*For questions about contributing, please open a GitHub issue or start a discussion. We're here to help you succeed!*