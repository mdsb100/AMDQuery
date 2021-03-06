define( "hash/charcode", [ "base/client" ], function( client ) {
  /**
   * @pubilc
   * @requires module:base/client
   * @module hash/charcode
   * @property {Object}  codeToStringReflect     - Code to string.
   * @property {String}  codeToStringReflect.108 - "Enter"
   * @property {String}  codeToStringReflect.112 - "F1"
   * @property {String}  codeToStringReflect.113 - "F2"
   * @property {String}  codeToStringReflect.114 - "F3"
   * @property {String}  codeToStringReflect.115 - "F4"
   * @property {String}  codeToStringReflect.116 - "F5"
   * @property {String}  codeToStringReflect.117 - "F6"
   * @property {String}  codeToStringReflect.118 - "F7"
   * @property {String}  codeToStringReflect.119 - "F8"
   * @property {String}  codeToStringReflect.120 - "F9"
   * @property {String}  codeToStringReflect.121 - "F10"
   * @property {String}  codeToStringReflect.122 - "F11"
   * @property {String}  codeToStringReflect.123 - "F12"
   * @property {String}  codeToStringReflect.8   - "BackSpace"
   * @property {String}  codeToStringReflect.9   - "Tab"
   * @property {String}  codeToStringReflect.12  - "Clear"
   * @property {String}  codeToStringReflect.13  - "enter"
   * @property {String}  codeToStringReflect.19  - "Pause"
   * @property {String}  codeToStringReflect.20  - "Caps Lock"
   * @property {String}  codeToStringReflect.27  - "Escape"
   * @property {String}  codeToStringReflect.32  - "space"
   * @property {String}  codeToStringReflect.33  - "PageUp"
   * @property {String}  codeToStringReflect.34  - "PageDown"
   * @property {String}  codeToStringReflect.35  - "End"
   * @property {String}  codeToStringReflect.36  - "Home"
   * @property {String}  codeToStringReflect.37  - "Left"
   * @property {String}  codeToStringReflect.38  - "Up"
   * @property {String}  codeToStringReflect.39  - "Right"
   * @property {String}  codeToStringReflect.40  - "Down"
   * @property {String}  codeToStringReflect.41  - "Select"
   * @property {String}  codeToStringReflect.42  - "Print"
   * @property {String}  codeToStringReflect.43  - "Execute"
   * @property {String}  codeToStringReflect.45  - "Insert"
   * @property {String}  codeToStringReflect.46  - "Delete"
   * @property {String}  codeToStringReflect.91  - "LeftCommand"
   * @property {String}  codeToStringReflect.93  - "RightCommand"
   * @property {String}  codeToStringReflect.224 - "Command"
   *
   * @property {Object}  stringToCodeReflect              - String to code.
   * @property {Number}  stringToCodeReflect.Enter        - 108
   * @property {Number}  stringToCodeReflect.F1           - 112
   * @property {Number}  stringToCodeReflect.F2           - 113
   * @property {Number}  stringToCodeReflect.F3           - 114
   * @property {Number}  stringToCodeReflect.F4           - 115
   * @property {Number}  stringToCodeReflect.F5           - 116
   * @property {Number}  stringToCodeReflect.F6           - 117
   * @property {Number}  stringToCodeReflect.F7           - 118
   * @property {Number}  stringToCodeReflect.F8           - 119
   * @property {Number}  stringToCodeReflect.F9           - 120
   * @property {Number}  stringToCodeReflect.F10          - 121
   * @property {Number}  stringToCodeReflect.F11          - 122
   * @property {Number}  stringToCodeReflect.F12          - 123
   * @property {Number}  stringToCodeReflect.BackSpace    - 8
   * @property {Number}  stringToCodeReflect.Tab          - 9
   * @property {Number}  stringToCodeReflect.Clear        - 12
   * @property {Number}  stringToCodeReflect.enter        - 13
   * @property {Number}  stringToCodeReflect.Pause        - 19
   * @property {Number}  stringToCodeReflect.Caps Lock    - 20
   * @property {Number}  stringToCodeReflect.Escape       - 27
   * @property {Number}  stringToCodeReflect.space        - 32
   * @property {Number}  stringToCodeReflect.PageUp       - 33
   * @property {Number}  stringToCodeReflect.PageDown     - 34
   * @property {Number}  stringToCodeReflect.End          - 35
   * @property {Number}  stringToCodeReflect.Home         - 36
   * @property {Number}  stringToCodeReflect.Left         - 37
   * @property {Number}  stringToCodeReflect.Up           - 38
   * @property {Number}  stringToCodeReflect.Right        - 39
   * @property {Number}  stringToCodeReflect.Down         - 40
   * @property {Number}  stringToCodeReflect.Select       - 41
   * @property {Number}  stringToCodeReflect.Print        - 42
   * @property {Number}  stringToCodeReflect.Execute      - 43
   * @property {Number}  stringToCodeReflect.Insert       - 45
   * @property {Number}  stringToCodeReflect.Delete       - 46
   * @property {Number}  stringToCodeReflect.LeftCommand  - client.browser.firefox ? 224 : 91
   * @property {Number}  stringToCodeReflect.RightCommand - client.browser.firefox ? 224 : 93
   */
  return {
    codeToStringReflect: {
      108: "Enter",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      8: "BackSpace",
      9: "Tab",
      12: "Clear",
      13: "enter",
      19: "Pause",
      20: "Caps Lock",
      27: "Escape",
      32: "space",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "Left",
      38: "Up",
      39: "Right",
      40: "Down",
      41: "Select",
      42: "Print",
      43: "Execute",
      45: "Insert",
      46: "Delete",
      91: "LeftCommand",
      93: "RightCommand",
      224: "Command"
    },
    stringToCodeReflect: {
      "Enter": 108,
      "F1": 112,
      "F2": 113,
      "F3": 114,
      "F4": 115,
      "F5": 116,
      "F6": 117,
      "F7": 118,
      "F8": 119,
      "F9": 120,
      "F10": 121,
      "F11": 122,
      "F12": 123,
      "BackSpace": 8,
      "Tab": 9,
      "Clear": 12,
      "enter": 13,
      "Pause": 19,
      "Caps Lock": 20,
      "Escape": 27,
      "space": 32,
      "PageUp": 33,
      "PageDown": 34,
      "End": 35,
      "Home": 36,
      "Left": 37,
      "Up": 38,
      "Right": 39,
      "Down": 40,
      "Select": 41,
      "Print": 42,
      "Execute": 43,
      "Insert": 45,
      "Delete": 46,
      "LeftCommand": client.browser.firefox ? 224 : 91,
      "RightCommand": client.browser.firefox ? 224 : 93
    }
  }

} );