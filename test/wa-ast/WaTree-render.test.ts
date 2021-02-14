import "mocha";
import * as expect from "expect";
import { WaTree } from "../../src/wa-ast/WaTree";
import { WaType } from "../../src/wa-ast/wa-nodes";
import { constVal } from "../../src/wa-ast/FunctionBuilder";

describe("WaTree - render", () => {
  it("Empty source", () => {
    // --- Arrange
    const tree = new WaTree();

    // --- Act
    const text = tree.render();

    // --- Assert
    expect(text).toBe(
      `(module
  (memory (export "memory") 10)
)`
    );
  });

  it("FunctionImport #1", () => {
    // --- Arrange
    const tree = new WaTree();
    tree.functionImport("$myFunc", "imports", "myFunc", []);

    // --- Act
    const text = tree.render();

    // --- Assert
    console.log(text);
    expect(text).toBe(
      `(module
  (func $myFunc (import "imports" "myFunc"))
  (memory (export "memory") 10)
)`
    );
  });

  it("FunctionImport #2", () => {
    // --- Arrange
    const tree = new WaTree();
    tree.functionImport("$myFunc", "imports", "myFunc", [
      { id: "$addr", type: WaType.i32 },
    ]);

    // --- Act
    const text = tree.render();

    // --- Assert
    expect(text).toBe(
      `(module
  (func $myFunc (import "imports" "myFunc") (param $addr i32))
  (memory (export "memory") 10)
)`
    );
  });

  it("FunctionImport #3", () => {
    // --- Arrange
    const tree = new WaTree();
    tree.functionImport("$myFunc", "imports", "myFunc", [
      { id: "$addr", type: WaType.i32 },
      { id: "$other", type: WaType.f64 },
    ]);

    // --- Act
    const text = tree.render();

    // --- Assert
    expect(text).toBe(
      `(module
  (func $myFunc (import "imports" "myFunc") (param $addr i32) (param $other f64))
  (memory (export "memory") 10)
)`
    );
  });

  it("FunctionImport #4", () => {
    // --- Arrange
    const tree = new WaTree();
    tree.functionImport(
      "$myFunc",
      "imports",
      "myFunc",
      [
        { id: "$addr", type: WaType.i32 },
        { id: "$other", type: WaType.f64 },
      ],
      WaType.f32
    );

    // --- Act
    const text = tree.render();

    // --- Assert
    expect(text).toBe(
      `(module
  (func $myFunc (import "imports" "myFunc") (param $addr i32) (param $other f64) (result f32))
  (memory (export "memory") 10)
)`
    );
  });

  it("FunctionImport #5", () => {
    // --- Arrange
    const tree = new WaTree();
    tree.functionImport("$myFunc", "imports", "myFunc", [], WaType.i64);

    // --- Act
    const text = tree.render();

    // --- Assert
    expect(text).toBe(
      `(module
  (func $myFunc (import "imports" "myFunc") (result i64))
  (memory (export "memory") 10)
)`
    );
  });

  it("FunctionExport #1", () => {
    // --- Arrange
    const tree = new WaTree();
    tree.functionExport("$myFunc", "myFunc");

    // --- Act
    const text = tree.render();

    // --- Assert
    expect(text).toBe(
      `(module
  (memory (export "memory") 10)
  (export "myFunc" (func $myFunc))
)`
    );
  });


  it("Table #1", () => {
    // --- Arrange
    const tree = new WaTree();
    tree.setTable(100, "$myTable");

    // --- Act
    const text = tree.render();

    // --- Assert
    expect(text).toBe(
      `(module
  (memory (export "memory") 10)
  (table $myTable 100 anyfunc)
)`
    );
  });

  it("Global #1", () => {
    // --- Arrange
    const tree = new WaTree();
    tree.global("$myVar", WaType.i32, BigInt(123456));

    // --- Act
    const text = tree.render();

    // --- Assert
    expect(text).toBe(
      `(module
  (memory (export "memory") 10)
  (global $myVar (mut i32) (i32.const 123456))
)`
    );
  });

  it("Global #2", () => {
    // --- Arrange
    const tree = new WaTree();
    tree.global("$myVar", WaType.f64, BigInt(123456), "myVar");

    // --- Act
    const text = tree.render();

    // --- Assert
    expect(text).toBe(
      `(module
  (memory (export "memory") 10)
  (global $myVar (export myVar) (mut f64) (f64.const 123456))
)`
    );
  });

  it("Global #3", () => {
    // --- Arrange
    const tree = new WaTree();
    tree.global("$myVar", WaType.i32, undefined, "myVar");

    // --- Act
    const text = tree.render();

    // --- Assert
    expect(text).toBe(
      `(module
  (memory (export "memory") 10)
  (global $myVar (export myVar) (mut i32) (i32.const 0))
)`
    );
  });

  it("Global #4", () => {
    // --- Arrange
    const tree = new WaTree();
    tree.global("$myVar", WaType.f32);

    // --- Act
    const text = tree.render();

    // --- Assert
    expect(text).toBe(
      `(module
  (memory (export "memory") 10)
  (global $myVar (mut f32) (f32.const 0))
)`
    );
  });

  it("TypeDef #1", () => {
    // --- Arrange
    const tree = new WaTree();
    tree.typeDef("$myType", []);

    // --- Act
    const text = tree.render();

    // --- Assert
    expect(text).toBe(
      `(module
  (memory (export "memory") 10)
  (type $myType (func))
)`
    );
  });

  it("TypeDef #2", () => {
    // --- Arrange
    const tree = new WaTree();
    tree.typeDef("$myType", [{ id: "$addr", type: WaType.i32 }]);

    // --- Act
    const text = tree.render();

    // --- Assert
    expect(text).toBe(
      `(module
  (memory (export "memory") 10)
  (type $myType (func (param $addr i32)))
)`
    );
  });

  it("TypeDef #3", () => {
    // --- Arrange
    const tree = new WaTree();
    tree.typeDef("$myType", [
      { id: "$addr", type: WaType.i32 },
      { id: "$val", type: WaType.i64 },
    ]);

    // --- Act
    const text = tree.render();

    // --- Assert
    expect(text).toBe(
      `(module
  (memory (export "memory") 10)
  (type $myType (func (param $addr i32) (param $val i64)))
)`
    );
  });

  it("TypeDef #4", () => {
    // --- Arrange
    const tree = new WaTree();
    tree.typeDef(
      "$myType",
      [
        { id: "$addr", type: WaType.i32 },
        { id: "$val", type: WaType.i64 },
      ],
      WaType.f32
    );

    // --- Act
    const text = tree.render();

    // --- Assert
    expect(text).toBe(
      `(module
  (memory (export "memory") 10)
  (type $myType (func (param $addr i32) (param $val i64) (result f32)))
)`
    );
  });

  it("TypeDef #5", () => {
    // --- Arrange
    const tree = new WaTree();
    tree.typeDef("$myType", [], WaType.f32);

    // --- Act
    const text = tree.render();

    // --- Assert
    expect(text).toBe(
      `(module
  (memory (export "memory") 10)
  (type $myType (func (result f32)))
)`
    );
  });

  it("FunctionNode #1", () => {
    // --- Arrange
    const tree = new WaTree();
    const func = tree.func("$myFunc", []);
    func.addLocal("$myPar", WaType.i32);

    // --- Act
    const text = tree.renderFunctionNode(func);

    // --- Assert
    expect(text).toBe(
      `(func $myFunc
  (local $myPar i32)
)`
    );
  });

  it("FunctionNode #2", () => {
    // --- Arrange
    const tree = new WaTree();
    const func = tree.func(
      "$myFunc",
      [
        { id: "$addr", type: WaType.i32 },
        { id: "$val", type: WaType.i64 },
      ],
      WaType.f32
    );
    func.addLocal("$myPar", WaType.i32);

    // --- Act
    const text = tree.renderFunctionNode(func);

    // --- Assert
    expect(text).toBe(
      `(func $myFunc (param $addr i32) (param $val i64) (result f32)
  (local $myPar i32)
)`
    );
  });

  it("FunctionNode #3", () => {
    // --- Arrange
    const tree = new WaTree();
    const func = tree.func(
      "$myFunc",
      [
        { id: "$addr", type: WaType.i32 },
        { id: "$val", type: WaType.i64 },
      ],
      WaType.f32
    );
    func.addLocal("$myPar", WaType.i32);
    func.inject(
      constVal(
        WaType.i32,
        100,
        constVal(WaType.i64, 200),
        constVal(WaType.f32, 300)
      )
    );

    // --- Act
    const text = tree.renderFunctionNode(func);

    // --- Assert
    expect(text).toBe(
      `(func $myFunc (param $addr i32) (param $val i64) (result f32)
  (local $myPar i32)
  (i32.const 100
    (i64.const 200)
    (f32.const 300)
  )
)`
    );
  });
});
