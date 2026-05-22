import { SCHEMA_ORG_CONTEXT } from './constants.js';
import type { FaqPageSchemaOptions, FaqPageSchemaResult } from './types.js';

/**
 * Builds a `FAQPage` JSON-LD graph node.
 *
 * Google requires `mainEntity` with at least one `Question` (`name` + `acceptedAnswer.text`).
 *
 * @param options - FAQ questions and optional page `@id`.
 * @returns JSON-LD object ready to inject or stringify.
 *
 * @example
 * buildFaqPageSchema({
 *   id: 'https://example.com/faq/#faq',
 *   questions: [
 *     { name: 'First question?', answer: 'First answer.' },
 *   ],
 * });
 */
export const buildFaqPageSchema = ({
  id,
  questions,
}: FaqPageSchemaOptions): FaqPageSchemaResult => {
  const schema: FaqPageSchemaResult = {
    '@context': SCHEMA_ORG_CONTEXT,
    '@type': 'FAQPage',
    mainEntity: questions.map((question) => ({
      '@type': 'Question' as const,
      name: question.name,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text: question.answer,
      },
    })),
  };

  if (id !== undefined) {
    schema['@id'] = id;
  }

  return schema;
};
