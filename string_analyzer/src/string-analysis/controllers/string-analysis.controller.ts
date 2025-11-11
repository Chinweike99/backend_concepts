import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Body, 
  Param, 
  Query, 
  HttpStatus, 
  HttpCode,
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException
} from '@nestjs/common';
// import { StringAnalysisService } from '../services/string-analysis.service';
import { 
  AnalyzeStringDto, 
  FilterStringsDto, 
  NaturalLanguageFilterDto 
} from '../../dto/analyze-string.dto';
import type { 
  AnalyzedString, 
  StringsResponse, 
  NaturalLanguageResponse 
} from '../../interfaces/string-analysis.interface';
import { StringAnalysisService } from '../services/string-analysis.service';

@Controller('strings')
export class StringAnalysisController {
  constructor(private readonly stringAnalysisService: StringAnalysisService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async analyzeString(@Body() analyzeStringDto: AnalyzeStringDto): Promise<AnalyzedString> {
    const { value } = analyzeStringDto;

    if (typeof value !== 'string') {
      throw new UnprocessableEntityException('Value must be a string');
    }

    if (!value || value.trim().length === 0) {
      throw new BadRequestException('Value field is required and cannot be empty');
    }

    // Check if string already exists
    if (this.stringAnalysisService.stringExists(value)) {
      throw new ConflictException('String already exists in the system');
    }

    // Analyze string
    const properties = this.stringAnalysisService.analyzedString(value);
    
    // Store analyzed string
    return this.stringAnalysisService.storeAnalyzedString(value, properties);
  }

    @Get('filter-by-natural-language')
  filterByNaturalLanguage(@Query() filterDto: NaturalLanguageFilterDto): NaturalLanguageResponse {
    const { query } = filterDto;
    const parsedFilters: any = {};
    
    try {
      const lowerQuery = query.toLowerCase();
      
      // Parse natural language query
      if (lowerQuery.includes('palindromic') || lowerQuery.includes('palindrome')) {
        parsedFilters.is_palindrome = true;
      }
      
      if (lowerQuery.includes('single word') || lowerQuery.includes('one word')) {
        parsedFilters.word_count = 1;
      } else if (lowerQuery.includes('word')) {
        const wordMatch = lowerQuery.match(/(\d+)\s*word/);
        if (wordMatch) {
          parsedFilters.word_count = parseInt(wordMatch[1]);
        }
      }
      
      if (lowerQuery.includes('longer than') || lowerQuery.includes('more than')) {
        const lengthMatch = lowerQuery.match(/(\d+)\s*character/);
        if (lengthMatch) {
          parsedFilters.min_length = parseInt(lengthMatch[1]) + 1;
        }
      }
      
      if (lowerQuery.includes('shorter than') || lowerQuery.includes('less than')) {
        const lengthMatch = lowerQuery.match(/(\d+)\s*character/);
        if (lengthMatch) {
          parsedFilters.max_length = parseInt(lengthMatch[1]) - 1;
        }
      }
      
      // Character search
      const characterMatch = lowerQuery.match(/contain(s|ing)?\s*(the\s+)?(letter|character)\s+([a-z])/);
      if (characterMatch && characterMatch[4]) {
        parsedFilters.contains_character = characterMatch[4];
      } else {
        // Fallback: look for any single character mention
        const singleCharMatch = lowerQuery.match(/\s([a-z])\s/);
        if (singleCharMatch) {
          parsedFilters.contains_character = singleCharMatch[1];
        }
      }
      
      // Apply parsed filters
      let filteredStrings = this.stringAnalysisService.getAllAnalyzedStrings();
      
      if (parsedFilters.is_palindrome !== undefined) {
        filteredStrings = filteredStrings.filter(
          str => str.properties.is_palindrome === parsedFilters.is_palindrome
        );
      }
      
      if (parsedFilters.word_count !== undefined) {
        filteredStrings = filteredStrings.filter(
          str => str.properties.word_count === parsedFilters.word_count
        );
      }
      
      if (parsedFilters.min_length !== undefined) {
        filteredStrings = filteredStrings.filter(
          str => str.properties.length >= parsedFilters.min_length
        );
      }
      
      if (parsedFilters.max_length !== undefined) {
        filteredStrings = filteredStrings.filter(
          str => str.properties.length <= parsedFilters.max_length
        );
      }
      
      if (parsedFilters.contains_character !== undefined) {
        filteredStrings = filteredStrings.filter(
          str => str.properties.character_frequency_map[parsedFilters.contains_character] !== undefined
        );
      }
      
      return {
        data: filteredStrings,
        count: filteredStrings.length,
        interpreted_query: {
          original: query,
          parsed_filters: parsedFilters
        }
      };
      
    } catch (error) {
      throw new BadRequestException('Unable to parse natural language query');
    }
  }

  @Get()
  getAllStrings(@Query() filters: FilterStringsDto): StringsResponse {
    let allStrings = this.stringAnalysisService.getAllAnalyzedStrings();
    const appliedFilters: any = {};

    // Apply filters
    if (filters.is_palindrome !== undefined) {
      const isPalindrome = filters.is_palindrome.toLowerCase() === 'true';
      allStrings = allStrings.filter(str => str.properties.is_palindrome === isPalindrome);
      appliedFilters.is_palindrome = isPalindrome;
    }

    if (filters.min_length !== undefined) {
      const minLength = parseInt(filters.min_length);
      if (isNaN(minLength)) {
        throw new BadRequestException('min_length must be a valid integer');
      }
      allStrings = allStrings.filter(str => str.properties.length >= minLength);
      appliedFilters.min_length = minLength;
    }

    if (filters.max_length !== undefined) {
      const maxLength = parseInt(filters.max_length);
      if (isNaN(maxLength)) {
        throw new BadRequestException('max_length must be a valid integer');
      }
      allStrings = allStrings.filter(str => str.properties.length <= maxLength);
      appliedFilters.max_length = maxLength;
    }

    if (filters.word_count !== undefined) {
      const wordCount = parseInt(filters.word_count);
      if (isNaN(wordCount)) {
        throw new BadRequestException('word_count must be a valid integer');
      }
      allStrings = allStrings.filter(str => str.properties.word_count === wordCount);
      appliedFilters.word_count = wordCount;
    }

    if (filters.contains_character !== undefined) {
      if (filters.contains_character.length !== 1) {
        throw new BadRequestException('contains_character must be a single character');
      }
      const searchChar = filters.contains_character.toLowerCase();
      allStrings = allStrings.filter(str => 
        str.properties.character_frequency_map[searchChar] !== undefined
      );
      appliedFilters.contains_character = searchChar;
    }

    return {
      data: allStrings,
      count: allStrings.length,
      filters_applied: Object.keys(appliedFilters).length > 0 ? appliedFilters : undefined
    };
  }

  
  @Get(':string_value')
  getString(@Param('string_value') stringValue: string): AnalyzedString {
    const analyzedString = this.stringAnalysisService.getAnalyzedStringByValue(stringValue);
    
    if (!analyzedString) {
      throw new NotFoundException('String does not exist in the system');
    }

    return analyzedString;
  }

  @Delete(':string_value')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteString(@Param('string_value') stringValue: string): void {
    const analyzedString = this.stringAnalysisService.getAnalyzedStringByValue(stringValue);
    
    if (!analyzedString) {
      throw new NotFoundException('String does not exist in the system');
    }

    this.stringAnalysisService.deleteAnalyzedString(analyzedString.id);
  }
}