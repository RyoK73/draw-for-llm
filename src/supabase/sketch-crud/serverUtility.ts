"use server";
import pkg from "@/../package.json";

const getFabricVersion = (): string => pkg.dependencies.fabric;

export { getFabricVersion };
