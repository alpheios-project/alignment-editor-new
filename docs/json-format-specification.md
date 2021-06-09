# Specification of JSON file format used for input/output

|                 |             |              |              |               | Type     | Description             |
|-----------------|-------------|--------------|--------------|---------------|----------|-------------------------|
| **origin**          |             |              |              |               | Object   | All data of origin text |
|                 | **docSource**   |              |              |               | Object   | All data of origin source text |
|                 |             | **textId**       |              |               | String   | Unique id of the origin text |
|                 |             | **text**         |              |               | String   | Text |
|                 |             | **direction**    |              |               | String   | Direction of the text (ltr/rtl) |
|                 |             | **lang**         |              |               | String   | Lang code of the text (ISO-3) |
|                 |             | **sourceType**   |              |               | String   | Type of the text - text (plain text) or tei (tei xml) |
|                 |             |              | **tokenization** |               | Object   | All data of tokenizer |
|                 |             |              |              | **tokenizer**     | String   | Tokenizer name - alpheiosRemoteTokenizer or simpleLocalTokenizer | 
|                 |             |              |              | **segments**      | String   | Property that defines how tokenizer divides text to segments - singleline or doubleline |
|                 |             | **metadata**     |              |               | Array    | Metadata of the text |
|                 |             |              | **properties**   |               | Object   | Single metadata property |
|                 |             |              |              | **property**      | String   | Property name |
|                 |             |              |              | **value**         | String / Array[String]  | Property value - could be single value or multi-valued |
|                 | **alignedText** |              |              |               | Object   | All data of origin aligned text |
|                 |             | **textId**       |              |               | String   | Unique id of the origin text |
|                 |             | **textType**     |              |               | String   | Text type - origin/target |
|                 |             | **direction**    |              |               | String   | Direction of the text (ltr/rtl) |
|                 |             | **lang**         |              |               | String   | Lang code of the text (ISO-3) |
|                 |             | **tokenPrefix**  |              |               | String   | Prefix that is used for token idWord |
|                 |             |              | **tokenization** |               | Object   | All data of tokenizer |
|                 |             |              |              | **tokenizer**     | String   | Tokenizer name - alpheiosRemoteTokenizer or simpleLocalTokenizer |
|                 |             |              |              | **segments**      | String   | Property that defines how tokenizer divides text to segments - singleline or doubleline |
|                 |             | **segments**     |              |               | Array    | Array of segments data |
|                 |             |              | **index**        |               | Number   | Index number of segment | 
|                 |             |              | **textType**     |               | String   | Text type - origin/target |
|                 |             |              | **lang**         |               | String   | Lang code of the text (ISO-3) |
|                 |             |              | **direction**    |               | String   | Direction of the text (ltr/rtl) |
|                 |             |              | **docSourceId**  |               | String   | Unique id of the source text that was used for creation of aligned text |
|                 |             |              | **tokens**       |               | Array    | Array of tokens data |
|                 |             |              |              | **textType**      | String   | Text type - origin/target |
|                 |             |              |              | **idWord**        | String   | Unique id of the token (it is unique inside aligned text) |
|                 |             |              |              | **word**          | String   | Word |
|                 |             |              |              | **segmentIndex**  | Number   | Index number of segment |
|                 |             |              |              | **docSourceId**   | String   | Unique id of the source text that was used for creation of aligned text |
|                 |             |              |              | **sentenceIndex** | Number   | Index number of sentence |
| **targets**         |             |              |              |               | Object   | All data of targets text |
|                 | `targetId`  |              |              |               | Object   | All data of the target text with textId = targetId | 
|                 |             | **docSource**    |              |               | Object   | All data of target source text with textId = targetId - same format as origin |
|                 |             | **alignedText**  |              |               | Object   | All data of target aligned text with textId = targetId - same format as origin |
| **alignmentGroups** |             |              |              |               | Array    | Array of created alignment groups |
|                 |**actions**      |              |              |               | Object   | Data of a single alignment group |
|                 |**segmentIndex** |              |              |               | Number   | Index number of segment |
|                 |**targetId**     |              |              |               | String   | Unique textId of the used target text |
|                 |**origin**       |              |              |               | Array [String]    | Array of token's idWord from origin text |
|                 |**target**       |              |              |               | Array [String]    | Array of token's idWord from target text |

## JSON file example
```
{
    "origin": {
        "docSource": {
            "textId": "09036ace-ca5f-4ae3-84a2-3692593a6541",
            "text": "κατὰ τὴν χθὲς ὁμολογίαν , ὦ Σώκρατες",
            "direction": "ltr",
            "lang": "grc",
            "sourceType": "text",
            "tokenization": {
                "tokenizer": "alpheiosRemoteTokenizer",
                "segments": "doubleline"
            },
            "metadata": {
                "properties": [
                    {
                        "property": "title",
                        "value": "Test Greek Title"
                    },
                    {
                        "property": "creator",
                        "value": [
                            "Test Creator 1",
                            "Test Creator 2"
                        ]
                    }
                ]
            }
        },
        "alignedText": {
            "textId": "09036ace-ca5f-4ae3-84a2-3692593a6541",
            "textType": "origin",
            "direction": "ltr",
            "lang": "grc",
            "sourceType": "text",
            "tokenPrefix": "1",
            "tokenization": {
                "tokenizer": "alpheiosRemoteTokenizer",
                "segments": "doubleline"
            },
            "segments": [
                {
                    "index": 1,
                    "textType": "origin",
                    "lang": "grc",
                    "direction": "ltr",
                    "docSourceId": "09036ace-ca5f-4ae3-84a2-3692593a6541",
                    "tokens": [
                        {
                            "textType": "origin",
                            "idWord": "1-0-0",
                            "word": "κατὰ",
                            "segmentIndex": 1,
                            "docSourceId": "09036ace-ca5f-4ae3-84a2-3692593a6541",
                            "sentenceIndex": 1
                        },
                        {
                            "textType": "origin",
                            "idWord": "1-0-1",
                            "word": "τὴν",
                            "segmentIndex": 1,
                            "docSourceId": "09036ace-ca5f-4ae3-84a2-3692593a6541",
                            "sentenceIndex": 1
                        },
                        {
                            "textType": "origin",
                            "idWord": "1-0-2",
                            "word": "χθὲς",
                            "segmentIndex": 1,
                            "docSourceId": "09036ace-ca5f-4ae3-84a2-3692593a6541",
                            "sentenceIndex": 1
                        },
                        {
                            "textType": "origin",
                            "idWord": "1-0-3",
                            "word": "ὁμολογίαν",
                            "segmentIndex": 1,
                            "docSourceId": "09036ace-ca5f-4ae3-84a2-3692593a6541",
                            "sentenceIndex": 1
                        },
                        {
                            "textType": "origin",
                            "idWord": "1-0-4",
                            "word": ",",
                            "segmentIndex": 1,
                            "docSourceId": "09036ace-ca5f-4ae3-84a2-3692593a6541",
                            "sentenceIndex": 1
                        },
                        {
                            "textType": "origin",
                            "idWord": "1-0-5",
                            "word": "ὦ",
                            "segmentIndex": 1,
                            "docSourceId": "09036ace-ca5f-4ae3-84a2-3692593a6541",
                            "sentenceIndex": 1
                        },
                        {
                            "textType": "origin",
                            "idWord": "1-0-6",
                            "word": "Σώκρατες",
                            "segmentIndex": 1,
                            "docSourceId": "09036ace-ca5f-4ae3-84a2-3692593a6541",
                            "sentenceIndex": 1
                        }
                    ]
                }
            ]
        }
    },
    "targets": {
        "337dd08b-2b23-4c5e-af2e-2781f8f0e55a": {
            "docSource": {
                "textId": "337dd08b-2b23-4c5e-af2e-2781f8f0e55a",
                "text": "როგორც გუშინ შევთანხმდით , სოკრატე",
                "direction": "ltr",
                "lang": "kat",
                "sourceType": "text",
                "tokenization": {
                    "tokenizer": "alpheiosRemoteTokenizer",
                    "segments": "doubleline"
                },
                "metadata": {
                    "properties": [
                        {
                            "property": "title",
                            "value": "Test Georgian Title"
                        }
                    ]
                }
            },
            "alignedText": {
                "textId": "337dd08b-2b23-4c5e-af2e-2781f8f0e55a",
                "textType": "target",
                "direction": "ltr",
                "lang": "kat",
                "sourceType": "text",
                "tokenPrefix": 2,
                "tokenization": {
                    "tokenizer": "alpheiosRemoteTokenizer",
                    "segments": "doubleline"
                },
                "segments": [
                    {
                        "index": 1,
                        "textType": "target",
                        "lang": "kat",
                        "direction": "ltr",
                        "docSourceId": "337dd08b-2b23-4c5e-af2e-2781f8f0e55a",
                        "tokens": [
                            {
                                "textType": "target",
                                "idWord": "2-0-0",
                                "word": "როგორც",
                                "segmentIndex": 1,
                                "docSourceId": "337dd08b-2b23-4c5e-af2e-2781f8f0e55a",
                                "sentenceIndex": 1
                            },
                            {
                                "textType": "target",
                                "idWord": "2-0-1",
                                "word": "გუშინ",
                                "segmentIndex": 1,
                                "docSourceId": "337dd08b-2b23-4c5e-af2e-2781f8f0e55a",
                                "sentenceIndex": 1
                            },
                            {
                                "textType": "target",
                                "idWord": "2-0-2",
                                "word": "შევთანხმდით",
                                "segmentIndex": 1,
                                "docSourceId": "337dd08b-2b23-4c5e-af2e-2781f8f0e55a",
                                "sentenceIndex": 1
                            },
                            {
                                "textType": "target",
                                "idWord": "2-0-3",
                                "word": ",",
                                "segmentIndex": 1,
                                "docSourceId": "337dd08b-2b23-4c5e-af2e-2781f8f0e55a",
                                "sentenceIndex": 1
                            },
                            {
                                "textType": "target",
                                "idWord": "2-0-4",
                                "word": "სოკრატე",
                                "segmentIndex": 1,
                                "docSourceId": "337dd08b-2b23-4c5e-af2e-2781f8f0e55a",
                                "sentenceIndex": 1
                            }
                        ]
                    }
                ]
            }
        }
    },
    "alignmentGroups": [
        {
            "actions": {
                "segmentIndex": 1,
                "targetId": "337dd08b-2b23-4c5e-af2e-2781f8f0e55a",
                "origin": [
                    "1-0-0"
                ],
                "target": [
                    "2-0-0"
                ]
            }
        }
    ]
}
```