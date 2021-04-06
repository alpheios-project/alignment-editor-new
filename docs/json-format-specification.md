# Specification of JSON file format used for input/output

|                 |             |              |              |               | Type     | Description             |
|-----------------|-------------|--------------|--------------|---------------|----------|-------------------------|
| origin          |             |              |              |               | Object   | All data of origin text |
|                 | docSource   |              |              |               | Object   | All data of origin source text |
|                 |             | textId       |              |               | String   | Unique id of the origin text |
|                 |             | text         |              |               | String   | Text |
|                 |             | direction    |              |               | String   | Direction of the text (ltr/rtl) |
|                 |             | lang         |              |               | String   | Lang code of the text (ISO-3) |
|                 |             | sourceType   |              |               | String   | Type of the text - text (plain text) or tei (tei xml) |
|                 |             |              | tokenization |               | Object   | All data of tokenizer |
|                 |             |              |              | tokenizer     | String   | Tokenizer name - alpheiosRemoteTokenizer or simpleLocalTokenizer |
|                 |             |              |              | segments      | String   | Property that defines how tokenizer divides text to segments - singleline or doubleline 
|                 |             | metadata     |              |               | Array    | Metadata of the text |
|                 |             |              | properties   |               | Object   | Single metadata property |
|                 |             |              |              | property      | String   | Property name |
|                 |             |              |              | value         | String / Array[String]  | Property value - could be single value or multi-valued |
|                 | alignedText |              |              |               | Object   | All data of origin aligned text |
|                 |             | textId       |              |               | String   | Unique id of the origin text |
|                 |             | textType     |              |               | String   | Text type - origin/target |
|                 |             | direction    |              |               | String   | Direction of the text (ltr/rtl) |
|                 |             | lang         |              |               | String   | Lang code of the text (ISO-3) |
|                 |             | tokenPrefix  |              |               | String   | Prefix that is used for token idWord |
|                 |             |              | tokenization |               | Object   | All data of tokenizer |
|                 |             |              |              | tokenizer     | String   | Tokenizer name - alpheiosRemoteTokenizer or simpleLocalTokenizer |
|                 |             | segments     |              |               | Array    | Array of segments data |
|                 |             |              | index        |               | Number   | Index number of segment |
|                 |             |              | textType     |               | String   | Text type - origin/target |
|                 |             |              | lang         |               | String   | Lang code of the text (ISO-3) |
|                 |             |              | direction    |               | String   | Direction of the text (ltr/rtl) |
|                 |             |              | docSourceId  |               | String   | Unique id of the source text that was used for creation of aligned text |
|                 |             |              | tokens       |               | Array    | Array of tokens data |
|                 |             |              |              | textType      | String   | Text type - origin/target |
|                 |             |              |              | idWord        | String   | Unique id of the token (it is unique inside aligned text) |
|                 |             |              |              | word          | String   | Word |
|                 |             |              |              | segmentIndex  | Number   | Index number of segment |
|                 |             |              |              | docSourceId   | String   | Unique id of the source text that was used for creation of aligned text |
|                 |             |              |              | sentenceIndex | Number   | Index number of sentence |
| targets         |             |              |              |               | Object   | All data of targets text | 
|                 | <targetId>  |              |              |               | Object   | All data of the target text with textId = targetId | 
|                 |             | docSource    |              |               | Object   | All data of target source text with textId = targetId |
|                 |             | alignedText  |              |               | Object   | All data of target aligned text with textId = targetId |
| alignmentGroups |             |              |              |               | Array    | Array of created alignment groups | 
|                 |actions      |              |              |               | Object   | Data of a single alignment group | 
|                 |segmentIndex |              |              |               | Number   | Index number of segment |
|                 |targetId     |              |              |               | String   | Unique textId of the used target text | 
|                 |origin       |              |              |               | Array [String]    | Array of token's idWord from origin text | 
|                 |target       |              |              |               | Array [String]    | Array of token's idWord from target text | 

