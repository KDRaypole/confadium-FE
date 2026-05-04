// Email template compilation and parsing utilities

export { compileEmailHtml, compileEmailText } from './compiler';
export {
  parseEmailHtml,
  isBuilderHtml,
  extractVariablesFromComponents,
  replaceVariablesInComponents,
  type ParsedEmailTemplate,
} from './parser';
export {
  EMAIL_TEMPLATE_PRESETS,
  getPresetById,
  type EmailTemplatePreset,
} from './presets';
