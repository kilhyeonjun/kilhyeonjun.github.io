#!/usr/bin/env python3
import importlib.util
from pathlib import Path
import unittest

MODULE_PATH = Path(__file__).with_name("verify-blog-post.py")
spec = importlib.util.spec_from_file_location("verify_blog_post", MODULE_PATH)
assert spec is not None and spec.loader is not None
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class MarkdownHazardTests(unittest.TestCase):
    def test_tilde_fenced_code_is_not_a_raw_mdx_brace_hazard(self):
        text = "~~~go\nfunc main() {\n}\n~~~\n"
        self.assertEqual(module.raw_braces(text), 0)

    def test_inline_code_braces_are_not_a_raw_mdx_brace_hazard(self):
        text = "객체 리터럴 `{}`을 사용합니다.\n"
        self.assertEqual(module.raw_braces(text), 0)

    def test_longer_closing_fence_is_valid(self):
        text = "```go\nfunc main() {\n}\n````\n"
        self.assertEqual(module.raw_braces(text), 0)

    def test_fence_may_be_indented_by_three_spaces(self):
        text = "   ~~~go\nfunc main() {\n}\n   ~~~\n"
        self.assertEqual(module.raw_braces(text), 0)

if __name__ == "__main__":
    unittest.main()
