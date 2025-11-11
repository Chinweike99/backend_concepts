import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { AnalyzedString, CharacterFrequencyMap, StringProperties } from 'src/interfaces/string-analysis.interface';

@Injectable()
export class StringAnalysisService {

    private analyzedStrings: Map<string, AnalyzedString> = new Map();

    analyzedString(value: string): StringProperties {
        const normalizedValue = value.trim().replace(/\s+/g, ' ');

        const length = normalizedValue.length;
        const is_palindrome = this.checkIsPalindrone(normalizedValue);
        const unique_characters = this.countUniqueCharacters(normalizedValue);
        const word_count = this.countWords(normalizedValue);
        const sha256_hash = this.calculateSHA256(normalizedValue);
        const character_frequency_map = this.buildCharacterFrequencyMap(normalizedValue);



        return {
            length,
            is_palindrome,
            unique_characters,
            word_count,
            sha256_hash,
            character_frequency_map,
        }
    }

    private checkIsPalindrone(str: string): boolean{
        const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, '')
        if(cleanStr.length <= 1) return true;

        const mid = Math.floor(cleanStr.length / 2);
        for(let i = 0; i < mid; i++){
            if(cleanStr[i] !== cleanStr[cleanStr.length - 1 -i]){
                return false;
            }
        };
        return true;
    }

    private countUniqueCharacters(str: string): number{
        const uniqueCh = new Set();
        for(const char of str.toLowerCase()){
            if(char !== ' '){
                uniqueCh.add(char)
            }
        }
        return uniqueCh.size;
    }

    private countWords(str: string): number {
        if(!str.trim()) return 0;
        return str.trim().split(/\s+/).length;
    }

    private calculateSHA256(str: string): string {
        return createHash('sha256').update(str).digest('hex')
    }

    private buildCharacterFrequencyMap(str: string): CharacterFrequencyMap{
        const frequencyMap: CharacterFrequencyMap = {};
        const lowerStr = str.toLowerCase();

        for(const char of lowerStr){
            if(char !== ' '){
                frequencyMap[char] = (frequencyMap[char] || 0) + 1
            }
        }
        return frequencyMap;
    }

      storeAnalyzedString(value: string, properties: StringProperties): AnalyzedString {
        const analyzedString: AnalyzedString = {
        id: properties.sha256_hash,
        value,
        properties,
        created_at: new Date().toISOString(),
        };

        this.analyzedStrings.set(properties.sha256_hash, analyzedString);
        return analyzedString;
    }

    getAnalyzedString(id: string): AnalyzedString | undefined {
        return this.analyzedStrings.get(id);
    }

    getAnalyzedStringByValue(value: string): AnalyzedString | undefined {
        const hash = this.calculateSHA256(value);
        return this.analyzedStrings.get(hash);
    }

    getAllAnalyzedStrings(): AnalyzedString[] {
        return Array.from(this.analyzedStrings.values());
    }

    deleteAnalyzedString(id: string): boolean {
        return this.analyzedStrings.delete(id);
    }

    stringExists(value: string): boolean {
        const hash = this.calculateSHA256(value);
        return this.analyzedStrings.has(hash);
    }

}
