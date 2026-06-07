declare module "*.svg" {
  import type React from "react";
  import type { SvgProps } from "react-native-svg";

  const SVGComponent: React.FC<SvgProps>;
  export default SVGComponent;
}
