fn main() {
    #[cfg(windows)]
    {
        println!("cargo:rustc-link-arg-bin=remove-sd-solo-mode=/MANIFEST:EMBED");
        println!("cargo:rustc-link-arg-bin=remove-sd-solo-mode=/MANIFESTUAC:level=\'requireAdministrator\'");
        println!("cargo:rustc-link-arg-bin=install-sd-solo-mode=/MANIFEST:EMBED");
        println!("cargo:rustc-link-arg-bin=install-sd-solo-mode=/MANIFESTUAC:level=\'requireAdministrator\'");
    }
}
