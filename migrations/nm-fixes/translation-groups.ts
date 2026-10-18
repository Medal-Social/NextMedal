/**
 * Translation groups for pages (Vault plan 2026-10-18 C9). On 2026-10-18,
 * 18 of 25 groups pointed only at missing documents (or a single one), and the
 * groups for Home/Changelog/Docs/Events/Newsletter pointed at the wrong copies.
 * Owner approves this table at the gate (Task 32, list A). Only published pages.
 */
export type Lang = 'en' | 'nb' | 'ar';
export type TranslationGroup = {
  id: string;
  label: string;
  create?: true;
  pages: Partial<Record<Lang, string>>;
};

export const TRANSLATION_GROUPS: readonly TranslationGroup[] = [
  {
    id: 'a0c55c92-0c7c-4173-b7fb-8a675af62268',
    label: 'Home',
    pages: {
      en: 'fa5f631e-545e-4fc2-b6b9-bebcd32dd29e',
      nb: '74cbf377-263d-497a-9f1d-fe93ce6d62e2',
      ar: '23c8c132-1b7a-4cc8-a4e6-bea80625cd06',
    },
  },
  {
    id: '757d2b5f-5c37-498d-8d37-c906f9d56494',
    label: 'Blog',
    pages: {
      en: '5c6e6991-8664-4b43-acd4-f1aa6fd458ad',
      nb: '45cdf4ad-7346-43f6-9733-a41febedb8cd',
      ar: '8f38318c-5877-4536-8ad1-2659d3cbd981',
    },
  },
  {
    id: 'af3c10fc-2e19-457f-8fe4-1dd9cd476cde',
    label: 'Changelog',
    pages: {
      en: '1882fec2-060e-4b50-a170-30fb0f37d1ba',
      nb: 'ea5bac06-a342-4f0b-88e8-cdd0472eda2b',
      ar: '61873ebc-e1ff-4bc6-8992-7143e9ed2f10',
    },
  },
  {
    id: 'e0769b94-6f60-48d0-ab66-7f3e7b88966a',
    label: 'Docs',
    pages: {
      en: 'c1dc84f2-f810-46ec-8bf2-b88635b2e37e',
      nb: '0cb8074f-fb81-4a72-926b-b3d4bf1b4d42',
      ar: 'a8ca1bc9-c11d-4f30-85bf-919b9a52b5be',
    },
  },
  {
    id: '0a41c124-1e2c-4a1b-a870-4163c342b0d1',
    label: 'Events',
    pages: {
      en: '6ea8352f-92fe-46bd-b1f7-16af1d46e20b',
      nb: 'b1ec5d7c-d2c5-4959-8b70-5401dccbfd48',
      ar: 'b4abe66c-3d0b-4004-965c-33d94b551eeb',
    },
  },
  {
    id: '62da2612-dc0a-4e2c-a9b1-c83f8cb7eeeb',
    label: 'Newsletter',
    pages: {
      en: '31deab03-f039-4d17-bfb3-a990b629a914',
      nb: 'b543a3a3-6cea-4bec-b6b8-31e0f6cb42ce',
      ar: '729eaa88-335a-4fc4-88d5-ced936ae0a8b',
    },
  },
  {
    id: 'a0a07d0d-0ad4-44cb-9c02-f31931230d6f',
    label: 'Privacy',
    pages: {
      en: 'e77cef43-7a03-4691-8375-662f01ecad58',
      nb: '411b3401-0ac3-4aa7-b085-89c31a6e6a9e',
      ar: 'c2bfa56b-a753-40a3-89e8-77d8b72bf515',
    },
  },
  // New groups. Ids without a dot: dotted ids are private and the public site could not read them.
  {
    id: 'tm-page-our-story',
    label: 'Our story',
    create: true,
    pages: {
      en: 'c0372fc3-5780-48cf-8a6f-681a4c4adac0',
      nb: '41df2c1a-ea92-4590-8126-8378f7a56530',
      ar: '4c3587b2-7be7-4ad2-9202-89d5b898def6',
    },
  },
  {
    id: 'tm-page-contact-us',
    label: 'Contact',
    create: true,
    pages: {
      en: 'ade886a1-ad00-46b0-a3a3-1d187763b45f',
      nb: '6c619e2c-b8c5-43e9-ad93-8941c412f6d2',
      ar: 'ada0c123-3b3a-4572-8bdb-34a5bbf0dbc3',
    },
  },
  {
    id: 'tm-page-terms',
    label: 'Terms',
    create: true,
    pages: {
      en: '1821a218-33e4-4c77-becb-c955d3373b8b',
      nb: '4368543d-74b0-4f13-808e-c4ad1d77c2af',
      ar: 'b51eadc2-0ccd-4078-a1e5-221fed46852c',
    },
  },
  {
    id: 'tm-page-guides',
    label: 'Guides',
    create: true,
    pages: {
      en: '4e9ed39d-23cb-433b-b1d6-c6866e2a5447',
      nb: '67131f8e-54f2-49de-86e0-ca825ac7673a',
      ar: 'd0b0751f-e6fe-46aa-8d84-18a77a17e5f0',
    },
  },
];

/** Groups with fewer than two existing documents (2026-10-18). Deleted. */
export const DEAD_GROUP_IDS: readonly string[] = [
  '00ebda9b-9e40-44ff-8c22-58d1d0567df1',
  '1304ae0a-619d-4b49-92a1-fb400c6cbf8e',
  '1e8ff78a-200f-4422-8da9-edda9e0359f1',
  '30b0bf69-a040-45e4-acff-80d9796b06e9',
  '31a077e9-a2ea-451d-9c78-1e718e03fa32',
  '574b2ce3-403d-4b27-a2f3-add93ceb35cb',
  '6522afca-05b5-48e1-817a-479f65e05b44',
  '6eb5a492-39cd-4a1c-b05a-b09be9a3b91e',
  '79d25c3d-f53c-443f-b2fb-3257dedbe3d8',
  '7a12a509-2543-4a2e-a38e-144364926231',
  '838fd55e-a8f3-46f7-9ce7-c099f964ba89',
  '926f6660-f858-4ae8-88e2-3216e109a583',
  'a14b11cc-80d2-418a-908f-4fb8cd777911',
  'b68e1f6f-b4c6-41d3-9eac-f46164e713eb',
  'c0483369-d676-4472-ad62-afc7f03decb3',
  'c9da52c2-27b1-40c5-9b6f-6416130c16f4',
  'drafts.16378fcb-e4b6-4f24-8724-e5dfdf8db1bc',
  'e46760da-752b-45be-897c-88aacb19f66b',
];

/**
 * The group as @sanity/document-internationalization v6 stores it: the
 * language in `language` (the plugin reads only that; the 2026-10-18 groups
 * had it in `_key` only). `_key` = language keeps re-runs a no-op.
 */
export function groupDocument(group: TranslationGroup) {
  return {
    _id: group.id,
    _type: 'translation.metadata',
    schemaTypes: ['page'],
    translations: (Object.entries(group.pages) as [Lang, string][]).map(([language, ref]) => ({
      _key: language,
      _type: 'internationalizedArrayReferenceValue',
      language,
      value: {
        _type: 'reference',
        _ref: ref,
        _weak: true,
        _strengthenOnPublish: { type: 'page' },
      },
    })),
  };
}
