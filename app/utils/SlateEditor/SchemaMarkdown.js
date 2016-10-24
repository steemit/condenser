import React from 'react'
import Image from 'app/utils/SlateEditor/Image'

export const schema = {
    defaultNode: 'paragraph',
    toolbarMarks: [
    ],

    nodes: {
        paragraph:     ({ children, attributes }) => <p {...attributes}>{children}</p>,
        image: Image,
    },

    marks: {
    },
}

// export const MarkdownRules = [
//
//     // Block rules
//     {
//         deserialize: (el, next) => {
//         },
//         serialize: (object, children) => {
//         }
//     },
//
//     // Mark rules
//     {
//         deserialize: (el, next) => {
//         },
//         serialize: (object, children) => {
//         }
//     },
//
//     // Custom
//     {
//         deserialize: (el, next) => {
//         },
//         serialize: (object, children) => {
//         }
//     }
// ]
