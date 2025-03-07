import { useDark, useSwitch } from "./liteUse";

const { colorSchema, system: systemPreferredColor, isDark } = useDark();
const switchColorSchema = useSwitch(colorSchema, ["light", "dark", "auto"]);

export { colorSchema, switchColorSchema, systemPreferredColor, isDark };
