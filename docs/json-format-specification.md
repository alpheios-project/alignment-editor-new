# Specification of JSON file format used for input/output

|                 |             |              |              |               | Type     | Description             | Example |
|-----------------|-------------|--------------|--------------|---------------|----------|-------------------------| ------- |
| **origin**          |             |              |              |               | Object   | All data of origin text | { |
|                 | **docSource**   |              |              |               | Object   | All data of origin source text | { |
|                 |             | **textId**       |              |               | String   | Unique id of the origin text | 1306eb32-2413-4841-bfb3-782c1f7420fd |
|                 |             | **text**         |              |               | String   | Text | κατὰ τὴν χθὲς ὁμολογίαν , ὦ Σώκρατες , ἥκομεν αὐτοί τε κοσμίως καὶ τόνδε τινὰ ξένον ἄγομεν |
|                 |             | **direction**    |              |               | String   | Direction of the text (ltr/rtl) | ltr |
|                 |             | **lang**         |              |               | String   | Lang code of the text (ISO-3) | grc |
|                 |             | **sourceType**   |              |               | String   | Type of the text - text (plain text) or tei (tei xml) | text |
|                 |             |              | **tokenization** |               | Object   | All data of tokenizer | { |
|                 |             |              |              | **tokenizer**     | String   | Tokenizer name - alpheiosRemoteTokenizer or simpleLocalTokenizer | alpheiosRemoteTokenizer |
|                 |             |              |              | **segments**      | String   | Property that defines how tokenizer divides text to segments - singleline or doubleline |  doubleline |
|                 |             | **metadata**     |              |               | Array    | Metadata of the text | { |
|                 |             |              | **properties**   |               | Object   | Single metadata property | [ |
|                 |             |              |              | **property**      | String   | Property name | title |
|                 |             |              |              | **value**         | String / Array[String]  | Property value - could be single value or multi-valued | Test Origin title |
|                 | **alignedText** |              |              |               | Object   | All data of origin aligned text | { |
|                 |             | **textId**       |              |               | String   | Unique id of the origin text | 1306eb32-2413-4841-bfb3-782c1f7420fd |
|                 |             | **textType**     |              |               | String   | Text type - origin/target | origin |
|                 |             | **direction**    |              |               | String   | Direction of the text (ltr/rtl) | ltr |
|                 |             | **lang**         |              |               | String   | Lang code of the text (ISO-3) | grc |
|                 |             | **tokenPrefix**  |              |               | String   | Prefix that is used for token idWord | 1 |
|                 |             |              | **tokenization** |               | Object   | All data of tokenizer | { |
|                 |             |              |              | **tokenizer**     | String   | Tokenizer name - alpheiosRemoteTokenizer or simpleLocalTokenizer | alpheiosRemoteTokenizer |
|                 |             |              |              | **segments**      | String   | Property that defines how tokenizer divides text to segments - singleline or doubleline |  doubleline |
|                 |             | **segments**     |              |               | Array    | Array of segments data | [ |
|                 |             |              | **index**        |               | Number   | Index number of segment | 1 |
|                 |             |              | **textType**     |               | String   | Text type - origin/target | origin |
|                 |             |              | **lang**         |               | String   | Lang code of the text (ISO-3) | grc |
|                 |             |              | **direction**    |               | String   | Direction of the text (ltr/rtl) | ltr |
|                 |             |              | **docSourceId**  |               | String   | Unique id of the source text that was used for creation of aligned text | 1306eb32-2413-4841-bfb3-782c1f7420fd |
|                 |             |              | **tokens**       |               | Array    | Array of tokens data | [ |
|                 |             |              |              | **textType**      | String   | Text type - origin/target | origin |
|                 |             |              |              | **idWord**        | String   | Unique id of the token (it is unique inside aligned text) | 1-0-0 |
|                 |             |              |              | **word**          | String   | Word | κατὰ |
|                 |             |              |              | **segmentIndex**  | Number   | Index number of segment | 1 |
|                 |             |              |              | **docSourceId**   | String   | Unique id of the source text that was used for creation of aligned text | 1306eb32-2413-4841-bfb3-782c1f7420fd |
|                 |             |              |              | **sentenceIndex** | Number   | Index number of sentence | 1 |
| **targets**         |             |              |              |               | Object   | All data of targets text | { |
|                 | `targetId`  |              |              |               | Object   | All data of the target text with textId = targetId | 27c87d3d-2b22-4068-8425-a67e3ea37871 : { |
|                 |             | **docSource**    |              |               | Object   | All data of target source text with textId = targetId - same format as origin | | 
|                 |             | **alignedText**  |              |               | Object   | All data of target aligned text with textId = targetId - same format as origin | |
| **alignmentGroups** |             |              |              |               | Array    | Array of created alignment groups | [ |
|                 |**actions**      |              |              |               | Object   | Data of a single alignment group | { |
|                 |**segmentIndex** |              |              |               | Number   | Index number of segment | 1 |
|                 |**targetId**     |              |              |               | String   | Unique textId of the used target text | 85865ec1-0d06-4efe-89a2-8ad5b10924b0 |
|                 |**origin**       |              |              |               | Array [String]    | Array of token's idWord from origin text | [ "1-0-4" ] |
|                 |**target**       |              |              |               | Array [String]    | Array of token's idWord from target text | [ "3-0-3" ] |

