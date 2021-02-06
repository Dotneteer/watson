import "mocha";
import * as expect from "expect";

import { WatSharpParser } from "../../src/compiler/WatSharpParser";

describe("WatSharpParser - resolution", () => {
  it("duplicated ID #1", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    const long a = 1;
    u8 a;
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W100");
  });

  it("duplicated ID #2", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    const long a = 1;
    u8 a;
    type a = f32;
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(2);
    expect(wParser.errors[0].code).toBe("W100");
    expect(wParser.errors[1].code).toBe("W100");
  });

  it("duplicated ID #3", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    const long a = 1;
    table a { myFunc };
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W100");
  });

  it("duplicated ID #4", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    const long a = 1;
    global u8 a = 3;
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W100");
  });

  it("duplicated ID #5", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    const long a = 1;
    data a [1, 2, 3];
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W100");
  });

  it("duplicated ID #6", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    const long a = 1;
    import void a "import" "myFunc"();
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W100");
  });

  it("duplicated ID #7", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    const long a = 1;
    void a (){};
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W100");
  });

});
