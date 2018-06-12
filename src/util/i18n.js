export function getLanguageAnalyzerByCode(code) {
  switch (code) {
    case 'en':
      return 'english';

    case 'ru':
      return 'russian';

    default:
      return 'english';
  }
}
