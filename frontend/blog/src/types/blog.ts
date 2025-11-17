/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/blog.json`.
 */
export type Blog = {
  "address": "M4h1dMsA4b25oM7GAR6ycYAhwc3fS9HVQoKh8hS1Une",
  "metadata": {
    "name": "blog",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createBlogEntry",
      "discriminator": [
        49,
        38,
        245,
        188,
        173,
        155,
        102,
        157
      ],
      "accounts": [
        {
          "name": "blogEntry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  108,
                  111,
                  103
                ]
              },
              {
                "kind": "arg",
                "path": "title"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteBlogEntry",
      "discriminator": [
        34,
        46,
        189,
        76,
        234,
        254,
        159,
        219
      ],
      "accounts": [
        {
          "name": "blogEntry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  108,
                  111,
                  103
                ]
              },
              {
                "kind": "arg",
                "path": "title"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateBlogEntry",
      "discriminator": [
        118,
        136,
        107,
        134,
        181,
        231,
        124,
        180
      ],
      "accounts": [
        {
          "name": "blogEntry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  108,
                  111,
                  103
                ]
              },
              {
                "kind": "arg",
                "path": "title"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "blogEntryState",
      "discriminator": [
        32,
        194,
        56,
        21,
        2,
        166,
        32,
        91
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidTitle",
      "msg": "Title must be between 1 and 50 characters"
    },
    {
      "code": 6001,
      "name": "invalidContent",
      "msg": "Content must be between 1 and 1000 characters"
    },
    {
      "code": 6002,
      "name": "unauthorized",
      "msg": "Only the owner can modify or delete this blog entry"
    }
  ],
  "types": [
    {
      "name": "blogEntryState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "content",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
