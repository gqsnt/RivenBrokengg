const changeCase = require('change-case');

// flatMap: https://gist.github.com/samgiles/762ee337dff48623e729
// [B](f: (A) ⇒ [B]): [B]  ; Although the types in the arrays aren't strict (:
Array.prototype.flatMap = function(lambda) {
  return Array.prototype.concat.apply([], this.map(lambda));
};
Array.prototype.groupBy = function(lambda) {
  return Object.entries(this.reduce((agg, x) => {
    const k = lambda(x);
    (agg[k] = agg[k] || []).push(x);
    return agg;
  }, {}));
}

function capitalize(input) {
  return input[0].toUpperCase() + input.slice(1);
}

function decapitalize(input) {
  return input[0].toLowerCase() + input.slice(1);
}

function normalizeSchemaName(name) {
  return name.replace(/DTO/ig, '');
}

function normalizeArgName(name) {
  const tokens = name.split('_');
  const argName = decapitalize(tokens.map(capitalize).join(''));
  return 'base' === argName ? 'Base' : argName;
}

function normalizePropName(propName, schemaName, value) {
  const out = changeCase.snakeCase(propName);
  if ('type' === out)
    return 'r#' + out;
  return out;
  // return propName;
  // var tokens = propName.split('_');
  // var name = tokens.map(capitalize).join('');
  // if (name === schemaName)
  //   name += stringifyType(value);
  // return name;
}

function stringifyType(prop, endpoint = null, optional = false, fullpath = true, owned = true) {
  if (prop.anyOf) {
    prop = prop.anyOf[0];
  }

  let refType = prop['$ref'];
  if (refType) {
    return (!endpoint ? '' : changeCase.snakeCase(endpoint) + '::') +
      normalizeSchemaName(refType.slice(refType.indexOf('.') + 1));
  }
  if (optional) {
    return `Option<${stringifyType(prop, endpoint, false, fullpath)}>`;
  }
  switch (prop.type) {
    case 'boolean': return 'bool';
    case 'integer': return ('int32' === prop.format ? 'i32' : 'i64');
    case 'number': return ('float' === prop.format ? 'f32' : 'f64');
    case 'array':
      const subprop = stringifyType(prop.items, endpoint, optional, fullpath, owned);
      return (owned ? (fullpath ? 'std::vec::' : '') + `Vec<${subprop}>` : `&[${subprop}]`);
    case 'string': return (owned ? 'String' : '&str');
    case 'object':
      return 'std::collections::HashMap<' + stringifyType(prop['x-key'], endpoint, optional, fullpath, owned) + ', ' +
        stringifyType(prop.additionalProperties, endpoint, optional, fullpath, owned) + '>';
    default: return prop.type;
  }
}

function formatJsonProperty(name) {
  return `#[serde(rename = "${name}")]`;
}

function formatQueryParamStringify(name, prop, ownedOk = false) {
    switch (prop.type) {
        case 'boolean': return `${name} ? "true" : "false"`;
        case 'string': return name;
        default: return (ownedOk ? '' : '&*') + `${name}.to_string()`;
    }
}

function formatAddQueryParam(param) {
    let k = `"${param.name}"`;
    let name = changeCase.snakeCase(param.name);
    let nc = param.required ? '' : `if let Some(${name}) = ${name} `;
    let prop = param.schema;
    switch (prop.type) {
        case 'array': return `${nc}{ query_params.extend_pairs(${name}.iter()`
            + `.map(|w| (${k}, ${formatQueryParamStringify("w", prop, true)}))); }`;
        case 'object': throw 'unsupported';
        default:
            return `${nc}{ query_params.append_pair(${k}, ${formatQueryParamStringify(name, prop)}); }`;
    }
}

function formatRouteArgument(route, pathParams = []) {
  if (!pathParams.length)
    return `"${route}".to_owned()`;

  route = route.replace(/\{\S+?\}/g, '{}');
  const args = pathParams
    .map(({name}) => name)
    .map(changeCase.snakeCase)
    .join(', ');
  return `format!("${route}", ${args})`;
}

module.exports = {
  changeCase,
  capitalize,
  decapitalize,
  normalizeSchemaName,
  normalizeArgName,
  normalizePropName,
  stringifyType,
  formatJsonProperty,
  formatAddQueryParam,
  formatRouteArgument,
};