export interface CharacterFrequencyMap {
    [key: string]: number;
}

export interface StringProperties {
  length: number;
  is_palindrome: boolean;
  unique_characters: number;
  word_count: number;
  sha256_hash: string;
  character_frequency_map: CharacterFrequencyMap;
}


export interface AnalyzedString {
  id: string;
  value: string;
  properties: StringProperties;
  created_at: string;
}

export interface StringsResponse {
  data: AnalyzedString[];
  count: number;
  filters_applied?: any;
}

export interface NaturalLanguageResponse {
  data: AnalyzedString[];
  count: number;
  interpreted_query: {
    original: string;
    parsed_filters: any;
  };
}

