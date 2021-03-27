import { FunctionBuilder } from "./FunctionBuilder";
import {
  Func,
  FuncImport,
  Comment,
  Global,
  Element,
  Local,
  Module,
  TypeDef,
  WaBitSpec,
  WaInstruction,
  WaModuleField,
  WaNode,
  WaParameter,
  WaType,
  FuncExport,
  SeparatorLine,
  WaImportNode,
  Data,
} from "./wa-nodes";

/**
 * Represents a WebAssembly Text Format Source Tree
 */
export class WaTree {
  // --- The root module of the tree
  private readonly _module: Module;

  // --- Indentation to use
  private _indentSpaces = 2;

  /**
   * Initializes the tree
   */
  constructor() {
    this._module = {
      type: "Module",
      memory: {
        export: {
          name: "memory",
        },
        limit: 10,
      },
    };
  }

  /**
   * Gets the root module of the tree
   */
  get module(): Module {
    return this._module;
  }

  /**
   * Sets the module's memory specification
   * @param limit Memory limit (in 64K pages)
   * @param exp Optional memory export name
   */
  setMemorySpecification(limit: number, exp?: string): void {
    this._module.memory.limit = limit;
    if (exp) {
      this._module.memory.export.name = exp;
    }
  }

  /**
   * Sets the module's table specification
   * @param limit Table size
   * @param id Optional table name
   */
  setTable(limit: number, id?: string): void {
    this._module.table = {
      type: "Table",
      id: id ?? "$table",
      limit,
    };
  }

  // ==========================================================================
  // Module emission methods

  /**
   * Adds a function builder to this tree
   * @param builder
   */
  addFunc(builder: FunctionBuilder): void {
    this._module.fields.push(builder);
  }

  /**
   * Injects a function import node into the tree
   * @param id Function identifier
   * @param name1 First import nametag
   * @param name2 Second import nametag
   * @param params Function parameters
   * @param resultType Function result type
   */
  functionImport(
    id: string,
    name1: string,
    name2: string,
    params: WaParameter[],
    resultType?: WaType
  ): FuncImport {
    this.ensureFields();
    const newNode = <FuncImport>{
      type: "FuncImport",
      id,
      import: { name1, name2 },
      params,
      resultType,
    };
    this._module.fields.push(newNode);
    return newNode;
  }

  /**
   * Injects a function import node into the tree
   * @param id Function identifier
   * @param name1 First import nametag
   * @param name2 Second import nametag
   * @param params Function parameters
   * @param resultType Function result type
   */
  functionExport(id: string, name: string): FuncExport {
    this.ensureFields();
    const newNode = <FuncExport>{
      type: "FuncExport",
      id,
      export: { name },
    };
    this._module.fields.push(newNode);
    return newNode;
  }

  /**
   * Injects a mutable global declaration into the tree
   * @param id Global identifier
   * @param valueType Declaration value type
   * @param initialValue Initial value
   * @param exportId Optional export name
   */
  global(
    id: string,
    valueType?: WaType,
    initialValue?: number | bigint,
    exportId?: string
  ): Global {
    this.ensureFields();
    const newNode = <Global>{
      type: "Global",
      id,
      valueType,
      initialValue,
      exportSpec: exportId ? { name: exportId } : undefined,
    };
    this._module.fields.push(newNode);
    return newNode;
  }

  /**
   * Injects a type definition into the tree
   * @param id Type identifier
   * @param params Function parameters
   * @param resultType Optional result type
   */
  typeDef(id: string, params: WaParameter[], resultType?: WaType): TypeDef {
    this.ensureFields();
    const newNode = <TypeDef>{
      type: "TypeDef",
      id,
      params,
      resultType,
    };
    this._module.fields.push(newNode);
    return newNode;
  }

  /**
   * Injects an element into the tree
   * @param index Element index
   * @param ids Element IDs
   */
  element(index: number, ids: string[]): Element {
    this.ensureFields();
    const newNode = <Element>{
      type: "Element",
      index,
      ids,
    };
    this._module.fields.push(newNode);
    return newNode;
  }

  /**
   * Injects a data tag into the tree
   * @param index Element index
   * @param ids Element IDs
   */
   data(address: number, bytes: number[]): Data {
    this.ensureFields();
    const newNode = <Data>{
      type: "Data",
      address,
      bytes,
    };
    this._module.fields.push(newNode);
    return newNode;
  }

  /**
   * Injects a function into the tree
   * @param id Function identifier
   * @param params Function parameters
   * @param resultType Optional result type
   * @param body Instructions of the function body
   */
  func(
    id: string,
    params: WaParameter[],
    resultType?: WaType,
    locals?: Local[],
    body?: WaInstruction[]
  ): FunctionBuilder {
    this.ensureFields();
    const newNode = new FunctionBuilder(id, params, resultType, locals, body);
    return newNode;
  }

  /**
   * Injects a comment into the tree
   * @param id Type identifier
   * @param params Function parameters
   * @param resultType Optional result type
   */
  comment(text: string, isBlock?: boolean): Comment {
    this.ensureFields();
    const newNode = <Comment>{
      type: "Comment",
      text,
      isBlock,
    };
    this._module.fields.push(newNode);
    return newNode;
  }

  /**
   * Injects a separator line into the tree
   */
  separatorLine(): void {
    this.ensureFields();
    const newNode = <SeparatorLine>{
      type: "SeparatorLine",
    };
    this._module.fields.push(newNode);
  }

  /**
   * Ensures
   */
  private ensureFields(): void {
    if (!this._module.fields) {
      this._module.fields = [];
    }
  }

  // ==========================================================================
  // Rendering methods

  /**
   * Renders the WebAssembly tree
   */
  render(): string {
    return this.renderNode(this._module);
  }

  /**
   * Renders the specified node
   * @param node Node to render
   * @param indent Rendering indentation depth
   */
  renderNode(node: WaNode, indent: number = 0): string {
    const indentation = "".padStart(indent * this._indentSpaces, " ");
    return `${indentation}${this.renderInternal(node, indent)}`;
  }

  /**
   * Renders a Function node
   * @param node Node to render
   * @param indent Rendering indentation depth
   */
  renderFunctionNode(node: Func, indent: number = 0): string {
    const indentation = "".padStart(indent * this._indentSpaces, " ");
    const body = this.renderFunctionBody(node, indent + 1);
    return `${indentation}(func ${node.id}${
      node.params.length > 0 || node.resultType ? " " : ""
    }${this.renderFuncSignature(node.params, node.resultType)}\n${body}${
      body.length > 0 ? "\n" : ""
    }${indentation})`;
  }

  /**
   * Renders an instruction node with its children
   * @param node Function body node
   * @param indent Rendering indentation depth
   */
  renderInstructionNode(
    node: WaInstruction,
    indent: number = 0,
    parenthesized = false
  ): string {
    const indentation = "".padStart(indent * this._indentSpaces, " ");
    return `${indentation}${parenthesized ? "(" : ""}${this.renderPureBodyNode(
      node,
      indent
    )}${parenthesized ? ")" : ""}`;
  }

  // ==========================================================================
  // Helpers

  /**
   * Carries out the rendering
   * @param node Node to render
   * @param indent Rendering indentation depth
   */
  private renderInternal(node: WaNode, indent: number): string {
    switch (node.type) {
      case "Module": {
        const moduleFields = this.renderModule(node, indent + 1);
        return `(module\n${moduleFields}\n)`;
      }
    }
    return "";
  }

  /**
   * Renders a module
   * @param module Module to tender
   */
  private renderModule(module: Module, indent: number): string {
    const indentation = "".padStart(indent * this._indentSpaces, " ");
    const imports = (module.fields
      ? module.fields.filter((fi) => fi.type === "FuncImport")
      : []) as FuncImport[];
    const otherFields = module.fields
      ? module.fields.filter((fi) => fi.type !== "FuncImport")
      : [];
    return `${
      // --- Module imports
      imports
        .map((field) => this.renderModuleImport(field, indent))
        .join("\n") + (imports.length > 0 ? "\n" : "")
    }${
      indentation
      // --- Memory specification
    }(memory (export \"${module.memory.export.name ?? "memory"}\") ${
      module.memory.limit ?? 10
    })${module.table ? "\n" : ""}${
      // --- Table specification
      module.table
        ? indentation +
          "(table " +
          module.table.id +
          " " +
          module.table.limit +
          " anyfunc)"
        : ""
    }${otherFields.length > 0 ? "\n" : ""}${
      // --- Other module fields
      otherFields
        .map((field) => this.renderModuleField(field, indent))
        .join("\n")
    }`;
  }

  private renderModuleImport(field: WaImportNode, indent: number): string {
    const indentation = "".padStart(indent * this._indentSpaces, " ");
    return `${indentation}(func ${field.id} (import \"${
      field.import.name1
    }\" \"${field.import.name2}\")${
      field.params.length > 0 || field.resultType
        ? " " + this.renderFuncSignature(field.params, field.resultType)
        : ""
    })`;
  }

  /**
   * Renders a FuncImport node
   * @param node Node to render
   * @param indent Rendering indentation depth
   */
  private renderModuleField(field: WaModuleField, indent: number): string {
    const indentation = "".padStart(indent * this._indentSpaces, " ");
    const gap = "".padStart(this._indentSpaces, " ");
    switch (field.type) {
      case "FuncExport":
        return `${indentation}(export "${field.export.name}" (func ${field.id}))`;

      case "Global":
        return `${indentation}(global ${field.id} ${
          field.exportSpec ? "(export " + field.exportSpec.name + ") " : ""
        }(mut ${WaType[field.valueType]}) (${WaType[field.valueType]}.const ${
          field.initialValue ?? 0
        }))`;

      case "TypeDef":
        return `${indentation}(type ${field.id} (func${
          field.params.length > 0 || field.resultType ? " " : ""
        }${this.renderFuncSignature(field.params, field.resultType)}))`;

      case "Element":
        return `${indentation}(elem (i32.const ${field.index})\n${field.ids
          .map((id) => indentation + gap + id)
          .join("\n")}\n${indentation})`;

      case "Data":
        return `${indentation}(data (i32.const ${
          field.address
        }) "${field.bytes
          .map((b) => "\\" + (b & 0xff).toString(16).padStart(2, "0"))
          .join("")}")`;

      case "Func":
        return this.renderFunctionNode(field, indent);

      case "Comment":
        return (
          indentation +
          (field.isBlock ? `(; ${field.text} ;)` : `;; ${field.text}`)
        );

      case "SeparatorLine":
        return indentation;
    }
  }

  /**
   * Renders the signature of the specified function
   * @param params Function parameters
   * @param resultType Optional result types
   */
  private renderFuncSignature(
    params: WaParameter[],
    resultType?: WaType
  ): string {
    return `${params
      .map((p) => "(param " + (p.id ? p.id + " " : "") + WaType[p.type] + ")")
      .join(" ")}${params.length > 0 && resultType ? " " : ""}${
      resultType ? "(result " + WaType[resultType] + ")" : ""
    }`;
  }

  /**
   * Renders the body of a function
   * @param func Function body instructions
   */
  renderFunctionBody(func: Func, indent: number): string {
    const indentation = "".padStart(indent * this._indentSpaces, " ");
    const locals = func.locals
      .map((l) => `${indentation}${this.renderLocal(l)}`)
      .join("\n");
    const body = func.body
      .map((inst) => this.renderInstructionNode(inst, indent))
      .join("\n");
    return `${locals}${
      locals.length > 0 && body.length > 0 ? "\n" : ""
    }${body}`;
  }

  /**
   * Renders the specified local declaration
   * @param local Local declaration
   */
  renderLocal(local: Local): string {
    return `(local ${local.id} ${WaType[local.valueType]})`;
  }

  /**
   * Renders a function body node without its children
   * @param node
   */
  private renderPureBodyNode(
    node: WaInstruction | Comment,
    indent: number
  ): string {
    const indentation = "".padStart(indent * this._indentSpaces, " ");
    switch (node.type) {
      case "ConstVal":
        return `${WaType[node.valueType]}.const ${node.value}`;
      case "Unreachable":
        return "unreachable";
      case "Nop":
        return "nop";
      case "Branch":
        return `br ${node.label}`;
      case "BranchIf":
        return `br_if ${node.label}`;
      case "BranchTable":
        return `br_table${
          node.caseIds.length > 0 ? " " : ""
        }${node.caseIds.join(" ")} ${node.defaultId}`;
      case "Return":
        return "return";
      case "Call":
        return `call ${node.id}`;
      case "CallIndirect":
        return `call_indirect (type ${node.typeId})`;
      case "Drop":
        return "drop";
      case "Select":
        return "select";
      case "LocalGet":
        return `get_local ${node.id}`;
      case "LocalSet":
        return `set_local ${node.id}`;
      case "LocalTee":
        return `tee_local ${node.id}`;
      case "GlobalGet":
        return `get_global ${node.id}`;
      case "GlobalSet":
        return `set_global ${node.id}`;
      case "Load":
        return `${WaType[node.valueType]}.load${bitSpecToString(node.bits)}${
          node.bits !== WaBitSpec.None ? (node.signed ? "_s" : "_u") : ""
        }${node.offset ? " offset=" + node.offset : ""}${
          node.align ? " align=" + node.align : ""
        }`;
      case "Store":
        return `${WaType[node.valueType]}.store${bitSpecToString(node.bits)}${
          node.offset ? " offset=" + node.offset : ""
        }${node.align ? " align=" + node.align : ""}`;
      case "MemorySize":
        return "memory.size";
      case "MemoryGrow":
        return "memory.grow";
      case "Clz":
        return `${WaType[node.valueType]}.clz`;
      case "Ctz":
        return `${WaType[node.valueType]}.ctz`;
      case "PopCnt":
        return `${WaType[node.valueType]}.popcnt`;
      case "Add":
        return `${WaType[node.valueType]}.add`;
      case "Sub":
        return `${WaType[node.valueType]}.sub`;
      case "Mul":
        return `${WaType[node.valueType]}.mul`;
      case "Div":
        return `${WaType[node.valueType]}.div${signedTag(
          node.valueType,
          node.signed
        )}`;
      case "Rem":
        return `${WaType[node.valueType]}.rem${signedTag(
          node.valueType,
          node.signed
        )}`;
      case "And":
        return `${WaType[node.valueType]}.and`;
      case "Xor":
        return `${WaType[node.valueType]}.xor`;
      case "Or":
        return `${WaType[node.valueType]}.or`;
      case "Shl":
        return `${WaType[node.valueType]}.shl`;
      case "Shr":
        return `${WaType[node.valueType]}.shr${signedTag(
          node.valueType,
          node.signed
        )}`;
      case "Rotl":
        return `${WaType[node.valueType]}.rotl`;
      case "Rotr":
        return `${WaType[node.valueType]}.rotr`;
      case "Eqz":
        return `${WaType[node.valueType]}.eqz`;
      case "Eq":
        return `${WaType[node.valueType]}.eq`;
      case "Ne":
        return `${WaType[node.valueType]}.ne`;
      case "Le":
        return `${WaType[node.valueType]}.le${signedTag(
          node.valueType,
          node.signed
        )}`;
      case "Lt":
        return `${WaType[node.valueType]}.lt${signedTag(
          node.valueType,
          node.signed
        )}`;
      case "Ge":
        return `${WaType[node.valueType]}.ge${signedTag(
          node.valueType,
          node.signed
        )}`;
      case "Gt":
        return `${WaType[node.valueType]}.gt${signedTag(
          node.valueType,
          node.signed
        )}`;
      case "Wrap64":
        return "i32.wrap/i64";
      case "Extend32":
        return `i64.extend${signedTag(WaType.i32, node.signed)}/i32`;
      case "Trunc32":
        return `i32.trunc${signedTag(WaType.i32, node.signed)}/${
          WaType[node.valueType]
        }`;
      case "Trunc64":
        return `i64.trunc${signedTag(WaType.i32, node.signed)}/${
          WaType[node.valueType]
        }`;
      case "Convert32":
        return `f32.convert${signedTag(WaType.i32, node.signed)}/${
          WaType[node.valueType]
        }`;
      case "Convert64":
        return `f64.convert${signedTag(WaType.i32, node.signed)}/${
          WaType[node.valueType]
        }`;
      case "Demote64":
        return "f32.demote/f64";
      case "Promote32":
        return "f64.promote/f32";
      case "ReinterpretF32":
        return "i32.reinterpret/f32";
      case "ReinterpretF64":
        return "i64.reinterpret/f64";
      case "ReinterpretI32":
        return "f32.reinterpret/i32";
      case "ReinterpretI64":
        return "f64.reinterpret/i64";
      case "Abs":
        return `${WaType[node.valueType]}.abs`;
      case "Neg":
        return `${WaType[node.valueType]}.neg`;
      case "Ceil":
        return `${WaType[node.valueType]}.ceil`;
      case "Floor":
        return `${WaType[node.valueType]}.floor`;
      case "Trunc":
        return `${WaType[node.valueType]}.trunc`;
      case "Nearest":
        return `${WaType[node.valueType]}.nearest`;
      case "Sqrt":
        return `${WaType[node.valueType]}.sqrt`;
      case "Min":
        return `${WaType[node.valueType]}.min`;
      case "Max":
        return `${WaType[node.valueType]}.max`;
      case "CopySign":
        return `${WaType[node.valueType]}.copysign`;
      case "Block":
        const body = node.body
          .map((inst) => this.renderInstructionNode(inst, indent + 1))
          .join("\n");
        return `block ${node.id}${
          node.resultType === undefined
            ? ""
            : " (result " + WaType[node.resultType] + ")"
        }\n${body}${body.length > 0 ? "\n" : ""}${indentation}end`;
      case "Loop":
        const loop = node.body
          .map((inst) => this.renderInstructionNode(inst, indent + 1))
          .join("\n");
        return `loop ${node.id}${
          node.resultType === undefined
            ? ""
            : " (result " + WaType[node.resultType] + ")"
        }\n${loop}${loop.length > 0 ? "\n" : ""}${indentation}end`;
      case "If":
        const consequtive = node.consequtive
          ? node.consequtive
              .map((inst) => this.renderInstructionNode(inst, indent + 1))
              .join("\n")
          : "";
        const alternate = node.alternate
          ? node.alternate
              .map((inst) => this.renderInstructionNode(inst, indent + 1))
              .join("\n")
          : "";
        return `if${
          node.resultType === undefined
            ? ""
            : " (result " + WaType[node.resultType] + ")"
        }\n${consequtive}${consequtive.length > 0 ? "\n" : ""}${
          node.alternate ? `${indentation}else\n` : ""
        }${alternate}${alternate.length > 0 ? "\n" : ""}${indentation}end`;
      case "Comment":
        return node.isBlock ? `(; ${node.text} ;)` : `;; ${node.text}`;

      case "SeparatorLine":
        return indentation;
    }

    // --- Convert bit specification to string
    function bitSpecToString(bits: WaBitSpec): string {
      switch (bits) {
        case WaBitSpec.Bit8:
          return "8";
        case WaBitSpec.Bit16:
          return "16";
        case WaBitSpec.Bit32:
          return "32";
        default:
          return "";
      }
    }

    function signedTag(type: WaType, signed?: boolean): string {
      return type === WaType.i32 || type === WaType.i64
        ? signed
          ? "_s"
          : "_u"
        : "";
    }
  }
}
