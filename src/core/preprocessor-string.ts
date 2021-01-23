/**
 * Converts a perprocesor string literal to intrinsic string
 * @param input ZX Spectrum string to convert
 */
export function convertPPStringLiteralToRawString(input: string): string {
  input = input.substr(1, input.length - 2);
  let result = "";
  let state: StrParseState = StrParseState.Normal;
  let collect = 0;
  for (const ch of input) {
    switch (state) {
      case StrParseState.Normal:
        if (ch === "\\") {
          state = StrParseState.Backslash;
        } else {
          result += ch;
        }
        break;

      case StrParseState.Backslash:
        state = StrParseState.Normal;
        switch (ch) {
          case "b":
            result += "\b";
            break;
          case "f":
            result += "\f";
            break;
          case "n":
            result += "\n";
            break;
          case "r":
            result += "\r";
            break;
          case "t":
            result += "\t";
            break;
          case "v":
            result += "\v";
            break;
          case "0":
            result += "\0";
            break;
          case "'":
            result += "'";
            break;
          case '"':
            result += '"';
            break;
          case "\\":
            result += "\\";
            break;
          case "x":
            state = StrParseState.X;
            break;
          default:
            result += ch;
            break;
        }
        break;

      case StrParseState.X:
        if (
          (ch >= "0" && ch <= "9") ||
          (ch >= "a" && ch <= "f") ||
          (ch >= "A" && ch <= "F")
        ) {
          collect = parseInt(ch, 16);
          state = StrParseState.Xh;
        } else {
          result += "x";
          state = StrParseState.Normal;
        }
        break;

      case StrParseState.Xh:
        if (
          (ch >= "0" && ch <= "9") ||
          (ch >= "a" && ch <= "f") ||
          (ch >= "A" && ch <= "F")
        ) {
          collect = collect * 0x10 + parseInt(ch, 16);
          result += String.fromCharCode(collect);
          state = StrParseState.Normal;
        } else {
          result += String.fromCharCode(collect);
          result += ch;
          state = StrParseState.Normal;
        }
        break;
    }
  }

  // --- Handle the final machine state
  switch (state) {
    case StrParseState.Backslash:
      result += "\\";
      break;
    case StrParseState.X:
      result += "x";
      break;
    case StrParseState.Xh:
      result += String.fromCharCode(collect);
      break;
  }
  return result;
}

/**
 * States of the string parsing
 */
enum StrParseState {
  Normal,
  Backslash,
  X,
  Xh,
}
