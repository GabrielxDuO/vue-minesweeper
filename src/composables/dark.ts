import { useDark } from "./use-dark";
const { colorSchema, system: systemPreferredColor, isDark } = useDark();
import { useSwitch } from "./use-switch";
const switchColorSchema = useSwitch(colorSchema, ["light", "dark", "auto"]);
export { colorSchema, switchColorSchema, systemPreferredColor, isDark };
