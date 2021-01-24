import { FunctionBuilder } from "./FunctionBuilder";
import {
  Func,
  FuncImport,
  Global,
  Local,
  Module,
  TypeDef,
  WaBitSpec,
  WaFunctionBody,
  WaInstruction,
  WaModuleField,
  WaNode,
  WaParameter,
  WaType,
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
   * Injects a mutable global declaration into the tree
   * @param id Global identifier
   * @param valueType Declaration value type
   * @param initialValue Initial value
   * @param exportId Optional export name
   */
  global(
    id: string,
    valueType?: WaType,
    initialValue?: BigInt,
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
    this._module.fields.push(newNode);
    return newNode;
  }

  /**
   * Injects a new instruction to the body of the specified function
   * @param func Function
   * @param instr Function body instructions
   */
  body(func: Func, ...instr: WaInstruction[]): void {
    func.body.push(...instr);
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
    return `${"".padStart(indent * this._indentSpaces, " ")}(func ${node.id}${
      node.params.length > 0 || node.resultType ? " " : ""
    }${this.renderFuncSignature(
      node.params,
      node.resultType
    )}\n${this.renderFunctionBody(node, indent + 1)}\n)`;
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
    if (node.children.length > 0) {
      return `${indentation}(${this.renderPureBodyNode(
        node
      )}\n${node.children
        .map((ch) => this.renderInstructionNode(ch, indent + 1, true))
        .join("\n")}\n${indentation})`;
    }
    return `${indentation}${parenthesized ? "(" : ""}${this.renderPureBodyNode(
      node
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
        return `(module\n${this.renderModule(node, indent + 1)})`;
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
    return `${
      indentation
      // --- Memory specification
    }(memory (export \"${module.memory.export.name ?? "memory"}\" ${
      module.memory.limit ?? 10
    }))\n${
      // --- Module imports
      module.fields
        ? module.fields
            .map((field) => this.renderModuleField(field, indent))
            .join("") + "\n"
        : ""
      // --- Module exports
    }${
      // --- Table specification
      module.table
        ? indentation +
          "(table " +
          module.table.id +
          " " +
          module.table.limit +
          " anyfunc)\n"
        : ""
    }`;
  }

  /**
   * Renders a FuncImport node
   * @param node Node to render
   * @param indent Rendering indentation depth
   */
  private renderModuleField(field: WaModuleField, indent: number): string {
    const indentation = "".padStart(indent * this._indentSpaces, " ");
    switch (field.type) {
      case "FuncImport":
        return `${indentation}(func ${field.id} (import \"${
          field.import.name1
        }\" \"${field.import.name2}\")${
          field.params.length > 0 || field.resultType
            ? " " + this.renderFuncSignature(field.params, field.resultType)
            : ""
        })`;

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

      case "Func":
        return this.renderFunctionNode(field, indent);
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
      .map((p) => "(param " + (p.id + " " ?? " ") + WaType[p.type] + ")")
      .join(" ")}${params.length > 0 && resultType ? " " : ""}${
      resultType ? "(result " + WaType[resultType] + ")" : ""
    }`;
  }

  /**
   * Renders the body of a function
   * @param func Function body instructions
   */
  private renderFunctionBody(func: Func, indent: number): string {
    const indentation = "".padStart(indent * this._indentSpaces, " ");
    const locals = func.locals
      .map((l) => `${indentation}(local ${l.id} ${WaType[l.valueType]})`)
      .join("\n");
    const body = func.body
      .map((inst) => this.renderInstructionNode(inst, indent))
      .join("\n");
    return `${locals}${
      locals.length > 0 && body.length > 0 ? "\n" : ""
    }${body}`;
  }

  /**
   * Renders a function body node without its children
   * @param node
   */
  private renderPureBodyNode(node: WaInstruction): string {
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
        return `call_indirect ${node.id} ${node.typeId}`;
      case "Drop":
        return "drop";
      case "Select":
        return "select";
      case "LocalGet":
        return `local_get ${node.id}`;
      case "LocalSet":
        return `local_set ${node.id}`;
      case "LocalTee":
        return `local_tee ${node.id}`;
      case "GlobalGet":
        return `global_get ${node.id}`;
      case "GlobalSet":
        return `global_set ${node.id}`;
      case "GlobalSet":
        return `global_set ${node.id}`;
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
