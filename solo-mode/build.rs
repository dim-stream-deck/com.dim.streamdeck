fn main() {
    #[cfg(windows)]
    {
        println!("cargo:rustc-link-arg-bin=remove-sd-solo-enabler=/MANIFEST:EMBED");
        println!("cargo:rustc-link-arg-bin=remove-sd-solo-enabler=/MANIFESTUAC:level=\'requireAdministrator\'");
        println!("cargo:rustc-link-arg-bin=install-sd-solo-enabler=/MANIFEST:EMBED");
        println!("cargo:rustc-link-arg-bin=install-sd-solo-enabler=/MANIFESTUAC:level=\'requireAdministrator\'");
    }
}
