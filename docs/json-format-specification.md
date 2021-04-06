# Specification of JSON file format used for input/output

       |          |            |            |          | Type     | Description          |
-------|----------|------------|------------|----------|----------|----------------------|
origin |----------|------------|------------|----------| Object   |All data of origin text|
-------|docSource |------------|------------|----------| Object   |All data of origin source text|
-------|----------|textId      |------------|----------| String   |Unique id of the source text|
-------|----------|text        |------------|----------| String   |Text|
-------|----------|direction   |------------|----------| String   |Direction of the text (ltr/rtl)|
-------|----------|lang        |------------|----------| String   |Lang code of the text (ISO-3)|
-------|----------|sourceType  |------------|----------| String   |Type of the text - text (plain text) or tei (tei xml)|
-------|----------|------------|tokenization|----------| Object   |All data of tokenizer|
-------|----------|------------|------------|tokenizer | String   |Tokenizer name - alpheiosRemoteTokenizer or simpleLocalTokenizer|
-------|----------|------------|------------|segments  | String   |Property that defines how tokenizer divides text to segments - singleline or doubleline|
-------|----------|metadata    |------------|----------| Array    |Metadata of the text|
-------|----------|------------|properties  |----------| Object   |Single metadata property|
-------|----------|------------|------------|property  | String   |Property name|
-------|----------|------------|------------|value     | 
      alignedText
                textId
                textType
                direction
                lang
                tokenPrefix
                tokenization
                            tokenizer
                            segments
                segments
                            index
                            textType
                            lang
                            direction
                            docSourceId
                            tokens
                                       textType
                                       idWord
                                       word
                                       segmentIndex
                                       docSourceId
                                       sentenceIndex
targets
        <targetId>
                   docSource
                   alignedText
alignmentGroups
        actions
                  segmentIndex
                  targetId
                  origin
                          <idWord>
                  target
                          <idWord>
activeAlignmentGroup